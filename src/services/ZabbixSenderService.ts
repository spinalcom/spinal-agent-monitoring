import os from "os";
import net from "net";
import { ProcessDescription } from "pm2";
import SystemOverviewService from "./SystemOverviewService";
import { Pm2Service } from "./Pm2Service";
import { _generateZabbixMetrics } from "../utils/zabbixFunctions";
import { getAgentHostName } from "../utils/systemUtils";
import { getProcessId } from "../utils/pm2Utils";

type ZabbixMetric = {
	key: string;
	value: number | string;
};

type PushTransport = "tcp";

type ZabbixPushUpdate = {
	transport?: PushTransport;
	message?: string;
	host: string;
	metricsCount: number;
	timestamp: number;
	metrics?: ZabbixMetric[];
};

type Pm2Discovery = {
	data: Array<{
		"{#PROCNAME}": string;
		"{#PMID}": string;
	}>;
};

class ZabbixSenderService {
	private isFlushing = false;
	private _agentHostName: string = getAgentHostName();

	private static _instance: ZabbixSenderService;
	private readonly systemOverviewService = SystemOverviewService.getInstance();
	private readonly pm2Service = Pm2Service.getInstance();

	private intervalHandle: NodeJS.Timeout | null = null;
	private retryHandle: NodeJS.Timeout | null = null;
	private readonly queue: ZabbixMetric[][] = [];

	private pushUpdateCallback: ((update: ZabbixPushUpdate) => void) | null = null;

	private constructor() {}

	public static getInstance(): ZabbixSenderService {
		if (!this._instance) {
			this._instance = new ZabbixSenderService();
		}

		return this._instance;
	}

	public isCorrectlyConfigured(): boolean {
		const isActivated = process.env.ZABBIX_ENABLED == "true" || process.env.ZABBIX_ENABLED == "1";
		return isActivated;
	}

	public async startPeriodicPush(onPushUpdate?: (update: ZabbixPushUpdate) => void): Promise<void>;
	public async startPeriodicPush(updateIntervalMs: number): Promise<void>;
	public async startPeriodicPush(onPushUpdate: (update: ZabbixPushUpdate) => void, updateIntervalMs?: number): Promise<void>;
	public async startPeriodicPush(onPushUpdateOrInterval?: ((update: ZabbixPushUpdate) => void) | number, updateIntervalMs: number = 15000): Promise<void> {
		if (typeof onPushUpdateOrInterval === "function") {
			this.pushUpdateCallback = onPushUpdateOrInterval;
		} else if (typeof onPushUpdateOrInterval === "number") {
			updateIntervalMs = onPushUpdateOrInterval;
		}

		if (this.intervalHandle) return;

		// Immediately enqueue and flush the current snapshot before starting the interval
		await this.enqueueAndFlushCurrentSnapshot();

		// Start the periodic push interval
		this.intervalHandle = setInterval(() => {
			this.enqueueAndFlushCurrentSnapshot();
		}, updateIntervalMs);

		console.log(`Periodic push started (every ${updateIntervalMs} ms)`);
	}

	public stopPeriodicPush(): void {
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = null;
		}

		if (this.retryHandle) {
			clearTimeout(this.retryHandle);
			this.retryHandle = null;
		}
	}

	public async getPm2Discovery(processes?: ProcessDescription[]): Promise<Pm2Discovery> {
		if (!processes) processes = await this.pm2Service.getAllPm2Processes();

		return {
			data: processes.map((process) => ({
				"{#PROCNAME}": process.name || "unknown",
				"{#PMID}": getProcessId(process),
			})),
		};
	}

	private async enqueueAndFlushCurrentSnapshot(): Promise<void> {
		const metrics = await this._buildMetricsPayload();
		this.queue.push(metrics);
		await this.flushQueue();
	}

	private async flushQueue(): Promise<void> {
		// If already flushing or queue is empty, do nothing
		if (this.isFlushing || this.queue.length === 0) return;

		this.isFlushing = true;

		try {
			while (this.queue.length > 0) {
				const data = this.queue.shift();

				// Notify about the push update before sending to Zabbix
				this.notifyPushUpdate({
					host: this._agentHostName,
					metricsCount: data?.length || 0,
					timestamp: Date.now(),
					metrics: data || [],
				});

				await this.sendWithZabbixTcp(data || []);
			}
		} catch (error: any) {
			// console.error("Error sending data to Zabbix:", error);
		} finally {
			this.isFlushing = false;
		}
	}

	private async _buildMetricsPayload(): Promise<ZabbixMetric[]> {
		const systemMetrics = this.systemOverviewService.getSystemMetrics();
		const pm2Processes = await this.pm2Service.getAllPm2Processes();
		const discovery = await this.getPm2Discovery(pm2Processes);

		return _generateZabbixMetrics(systemMetrics, pm2Processes, discovery);
	}

	private notifyPushUpdate(update: ZabbixPushUpdate): void {
		if (this.pushUpdateCallback) {
			this.pushUpdateCallback(update);
		}
	}

	private async sendWithZabbixTcp(metrics: ZabbixMetric[]): Promise<void> {
		const now = Math.floor(Date.now() / 1000);

		const payload = {
			request: "sender data",
			clock: now,
			data: metrics.map((metric) => ({
				host: this._agentHostName,
				key: metric.key,
				value: String(metric.value),
				clock: now,
			})),
		};

		const packet = this.buildZabbixPacket(payload);

		const targetHost = process.env.ZABBIX_SERVER_HOST || "127.0.0.1";
		const targetPort = Number(process.env.ZABBIX_SERVER_PORT || 10051);

		return this._sendPacketToZabbixClient(targetHost!, targetPort, packet);
	}

	private _sendPacketToZabbixClient(host: string, port: number | string, packet: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			const client = net.createConnection({ host, port: Number(port) });
			const chunks: Buffer[] = [];
			client.setTimeout(10000);

			client.on("connect", () => {
				client.write(packet);
			});

			client.on("data", (chunk: Buffer) => {
				chunks.push(chunk);
			});

			client.on("timeout", () => {
				client.destroy();
				reject(new Error("Native Zabbix TCP send timeout"));
			});

			client.on("error", (error) => {
				reject(error);
			});

			client.on("end", () => {
				try {
					const responseBuffer = Buffer.concat(chunks);
					this.validateZabbixResponse(responseBuffer);
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	private buildZabbixPacket(payload: { [key: string]: unknown }): Buffer {
		const body = Buffer.from(JSON.stringify(payload), "utf8");
		const header = Buffer.alloc(13); // 5 bytes for "ZBXD\1" + 8 bytes for body length

		header.write("ZBXD", 0, "ascii");
		header.writeUInt8(1, 4);
		header.writeBigUInt64LE(BigInt(body.length), 5);

		return Buffer.concat([header, body]);
	}

	private validateZabbixResponse(responseBuffer: Buffer): void {
		if (responseBuffer.length < 13) {
			throw new Error("Invalid Zabbix response: too short");
		}

		const magic = responseBuffer.subarray(0, 4).toString("ascii");

		if (magic !== "ZBXD") {
			throw new Error("Invalid Zabbix response header");
		}

		const bodyLength = Number(responseBuffer.readBigUInt64LE(5));
		const bodyBuffer = responseBuffer.subarray(13, 13 + bodyLength);
		const bodyText = bodyBuffer.toString("utf8");

		let body: { [key: string]: unknown };
		try {
			body = JSON.parse(bodyText) as { [key: string]: unknown };
		} catch {
			throw new Error(`Invalid Zabbix JSON response: ${bodyText}`);
		}

		if (body.response !== "success") {
			const info = typeof body.info === "string" ? body.info : JSON.stringify(body);
			throw new Error(`Zabbix rejected data: ${info}`);
		}
	}
}

export { ZabbixSenderService, ZabbixMetric, Pm2Discovery, ZabbixPushUpdate };
export default ZabbixSenderService;

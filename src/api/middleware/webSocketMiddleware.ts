import { LOG_STREAM_EVENT_TYPE, MONITORING_MESSAGE_TYPE, PM2_PROCESS_EVENT_TYPE, SYSTEM_METRICS_EVENT_TYPE, ZABBIX_PUSH_EVENT_TYPE } from "../../utils/constants";
import SystemOverviewService from "../../system/SystemOverviewService";
import { Pm2Service } from "../../system/Pm2Service";
import fs from "fs";
import { Server, Socket } from "socket.io";
import { isValidMessage } from "../../utils/websocketUtils";
import { formatProcess, getProcessLogPath, PM2_METRICS_EVENT_TYPE } from "../../utils";
import { IPm2EventData } from "../../interfaces";

export class WebsocketMiddleware {
	private static _instance: WebsocketMiddleware;
	private _io: Server | null = null;
	private _isSystemMetricsStarted = false;
	private _isPm2EventsStarted = false;
	private _isPm2MetricsStarted = false;
	private systemInfoIntervalMs: number = 5000; // Default interval for system info updates

	private clientsClassifiedByType: { [key: string]: Socket[] } = {};

	private constructor() {}

	public static getInstance(): WebsocketMiddleware {
		if (!this._instance) {
			this._instance = new WebsocketMiddleware();
		}
		return this._instance;
	}

	public init(io: Server, systemInfoIntervalMs?: number): void {
		this._io = io;
		this.systemInfoIntervalMs = systemInfoIntervalMs || 5000;

		this._io.on("connection", (client: Socket) => {
			console.log("New WebSocket connection established from:", client.handshake.address);

			client.on(MONITORING_MESSAGE_TYPE, (message) => {
				try {
					const receivedMessage = typeof message === "string" ? JSON.parse(message) : message;

					if (!isValidMessage(receivedMessage)) throw new Error("Invalid message format");

					this.treatClientMessage(client, receivedMessage);
				} catch (error: Error | any) {
					const message = error.message || "Invalid message format";
					this.sendError(client, message);
					return;
				}
			});
		});
	}

	getAllConnectedClients(type?: string): Socket[] {
		if (this._io) {
			if (type) {
				return this.clientsClassifiedByType[type] || [];
			}

			return Array.from(this._io.sockets.sockets.values());
		}

		return [];
	}

	public async treatClientMessage(client: Socket, message: any) {
		let parsedMessage = message;

		if (typeof message === "string") {
			try {
				parsedMessage = JSON.parse(message);
			} catch {
				this.sendError(client, "Invalid message format");
				return;
			}
		}

		const requestType = parsedMessage?.type;

		switch (requestType) {
			case SYSTEM_METRICS_EVENT_TYPE:
				this._addClientToType(SYSTEM_METRICS_EVENT_TYPE, client);

				if (!this._isSystemMetricsStarted) {
					this._isSystemMetricsStarted = true;
					this.startSendingSystemMetrics();
				}
				break;
			case PM2_METRICS_EVENT_TYPE:
				this._addClientToType(PM2_METRICS_EVENT_TYPE, client);

				if (!this._isPm2MetricsStarted) {
					this._isPm2MetricsStarted = true;
					this.startSendingPm2Metrics();
				}
				break;

			// Handle PM2 event requests
			case PM2_PROCESS_EVENT_TYPE:
				this._addClientToType(PM2_PROCESS_EVENT_TYPE, client);

				if (!this._isPm2EventsStarted) {
					this._isPm2EventsStarted = true;
					this.startSendingPm2Events();
				}
				break;

			// Handle log stream requests
			case LOG_STREAM_EVENT_TYPE: {
				const id = parsedMessage?.data?.id || parsedMessage?.id;

				const process = await Pm2Service.getInstance().getPm2ProcessByKey(id);
				if (!process) {
					this.sendError(client, `PM2 process not found for id: ${id}`);
					return;
				}

				const logPath = getProcessLogPath(process, "out"); // Implement this function to retrieve the log path based on the provided id

				if (!logPath) {
					this.sendError(client, "Missing logPath for PM2 log stream");
					return;
				}

				if (!fs.existsSync(logPath)) {
					this.sendError(client, `Log file does not exist: ${logPath}`);
					return;
				}

				this._addClientToType(`${LOG_STREAM_EVENT_TYPE}:${logPath}`, client);
				this.sendStreamLogsToAllClients(logPath);
				break;
			}

			case ZABBIX_PUSH_EVENT_TYPE:
				this._addClientToType(ZABBIX_PUSH_EVENT_TYPE, client);
				break;

			default:
				this.sendError(client, "Unknown request type");
		}
	}

	public sendError(client: Socket, errorMessage: string) {
		client.emit("error", { type: "error", data: errorMessage });
	}

	private _addClientToType(type: string, client: Socket) {
		if (!this.clientsClassifiedByType[type]) {
			this.clientsClassifiedByType[type] = [];
		}

		const foundClient = this.clientsClassifiedByType[type].find((c) => c.id === client.id);
		if (foundClient) return;

		this.clientsClassifiedByType[type].push(client);
	}

	public startSendingSystemMetrics() {
		const metricsInterval = setInterval(() => {
			const systemOverview = SystemOverviewService.getInstance();
			const systemMetrics = systemOverview.getSystemMetricsFormatted();
			this._sendDataToAllClients({ type: SYSTEM_METRICS_EVENT_TYPE, data: systemMetrics });
		}, this.systemInfoIntervalMs);
	}

	public startSendingPm2Metrics() {
		const metricsInterval = setInterval(async () => {
			const pm2Service = Pm2Service.getInstance();
			const pm2Metrics = await pm2Service.getPm2MetricsFormatted();
			this._sendDataToAllClients({ type: PM2_METRICS_EVENT_TYPE, data: pm2Metrics });
		}, this.systemInfoIntervalMs);
	}

	public async startSendingPm2Events() {
		const pm2Service = Pm2Service.getInstance();
		await pm2Service.listenToPm2Actions((event: IPm2EventData) => {
			if (event.type !== "process:event") return;

			this._sendDataToAllClients({
				type: PM2_PROCESS_EVENT_TYPE,
				data: {
					...event,
					process: formatProcess(event.process),
				},
			});
		});
	}

	private _sendDataToAllClients(message: { [key: string]: any }) {
		const clients = this.getAllConnectedClients(message.type);

		if (clients.length > 0) {
			for (const client of clients) {
				// if (client === WebSocket.OPEN) {
				// 	client.send(JSON.stringify(message));
				// }
				client.emit(MONITORING_MESSAGE_TYPE, message);
			}
		}
	}

	public sendZabbixPushEvent(data: { [key: string]: any }) {
		this._sendDataToAllClients({ type: ZABBIX_PUSH_EVENT_TYPE, data });
	}

	public sendStreamLogsToAllClients(logPath: string) {
		console.log("Starting to stream logs from:", logPath);
		const logStream = fs.createReadStream(logPath, { encoding: "utf8", flags: "r" });

		logStream.on("data", (chunk) => {
			this._sendDataToAllClients({ type: `${LOG_STREAM_EVENT_TYPE}:${logPath}`, data: chunk });
		});

		fs.watchFile(logPath, (curr, prev) => {
			const stream = fs.createReadStream(logPath, { encoding: "utf8", start: logStream.bytesRead });
			stream.on("data", (data) => {
				this._sendDataToAllClients({ type: `${LOG_STREAM_EVENT_TYPE}:${logPath}`, data });
			});
		});
	}
}

export default WebsocketMiddleware;

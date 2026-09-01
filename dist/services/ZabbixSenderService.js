"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZabbixSenderService = void 0;
const net_1 = __importDefault(require("net"));
const SystemOverviewService_1 = __importDefault(require("./SystemOverviewService"));
const Pm2Service_1 = require("./Pm2Service");
const zabbixFunctions_1 = require("../utils/zabbixFunctions");
const systemUtils_1 = require("../utils/systemUtils");
const pm2Utils_1 = require("../utils/pm2Utils");
class ZabbixSenderService {
    constructor() {
        this.isFlushing = false;
        this._agentHostName = (0, systemUtils_1.getAgentHostName)();
        this.systemOverviewService = SystemOverviewService_1.default.getInstance();
        this.pm2Service = Pm2Service_1.Pm2Service.getInstance();
        this.intervalHandle = null;
        this.retryHandle = null;
        this.queue = [];
        this.pushUpdateCallback = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ZabbixSenderService();
        }
        return this._instance;
    }
    isCorrectlyConfigured() {
        const isActivated = process.env.ZABBIX_ENABLED == "true" || process.env.ZABBIX_ENABLED == "1";
        return isActivated;
    }
    async startPeriodicPush(onPushUpdateOrInterval, updateIntervalMs = 15000) {
        if (typeof onPushUpdateOrInterval === "function") {
            this.pushUpdateCallback = onPushUpdateOrInterval;
        }
        else if (typeof onPushUpdateOrInterval === "number") {
            updateIntervalMs = onPushUpdateOrInterval;
        }
        if (this.intervalHandle)
            return;
        // Immediately enqueue and flush the current snapshot before starting the interval
        await this.enqueueAndFlushCurrentSnapshot();
        // Start the periodic push interval
        this.intervalHandle = setInterval(() => {
            this.enqueueAndFlushCurrentSnapshot();
        }, updateIntervalMs);
        console.log(`Periodic push started (every ${updateIntervalMs} ms)`);
    }
    stopPeriodicPush() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        if (this.retryHandle) {
            clearTimeout(this.retryHandle);
            this.retryHandle = null;
        }
    }
    async getPm2Discovery(processes) {
        if (!processes)
            processes = await this.pm2Service.getAllPm2Processes();
        return {
            data: processes.map((process) => ({
                "{#PROCNAME}": process.name || "unknown",
                "{#PMID}": (0, pm2Utils_1.getProcessId)(process),
            })),
        };
    }
    async enqueueAndFlushCurrentSnapshot() {
        const metrics = await this._buildMetricsPayload();
        this.queue.push(metrics);
        await this.flushQueue();
    }
    async flushQueue() {
        // If already flushing or queue is empty, do nothing
        if (this.isFlushing || this.queue.length === 0)
            return;
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
        }
        catch (error) {
            // console.error("Error sending data to Zabbix:", error);
        }
        finally {
            this.isFlushing = false;
        }
    }
    async _buildMetricsPayload() {
        const systemMetrics = this.systemOverviewService.getSystemMetrics();
        const pm2Processes = await this.pm2Service.getAllPm2Processes();
        const discovery = await this.getPm2Discovery(pm2Processes);
        return (0, zabbixFunctions_1._generateZabbixMetrics)(systemMetrics, pm2Processes, discovery);
    }
    notifyPushUpdate(update) {
        if (this.pushUpdateCallback) {
            this.pushUpdateCallback(update);
        }
    }
    async sendWithZabbixTcp(metrics) {
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
        return this._sendPacketToZabbixClient(targetHost, targetPort, packet);
    }
    _sendPacketToZabbixClient(host, port, packet) {
        return new Promise((resolve, reject) => {
            const client = net_1.default.createConnection({ host, port: Number(port) });
            const chunks = [];
            client.setTimeout(10000);
            client.on("connect", () => {
                client.write(packet);
            });
            client.on("data", (chunk) => {
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
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    buildZabbixPacket(payload) {
        const body = Buffer.from(JSON.stringify(payload), "utf8");
        const header = Buffer.alloc(13); // 5 bytes for "ZBXD\1" + 8 bytes for body length
        header.write("ZBXD", 0, "ascii");
        header.writeUInt8(1, 4);
        header.writeBigUInt64LE(BigInt(body.length), 5);
        return Buffer.concat([header, body]);
    }
    validateZabbixResponse(responseBuffer) {
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
        let body;
        try {
            body = JSON.parse(bodyText);
        }
        catch {
            throw new Error(`Invalid Zabbix JSON response: ${bodyText}`);
        }
        if (body.response !== "success") {
            const info = typeof body.info === "string" ? body.info : JSON.stringify(body);
            throw new Error(`Zabbix rejected data: ${info}`);
        }
    }
}
exports.ZabbixSenderService = ZabbixSenderService;
exports.default = ZabbixSenderService;
//# sourceMappingURL=ZabbixSenderService.js.map
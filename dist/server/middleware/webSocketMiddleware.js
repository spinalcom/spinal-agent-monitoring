"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketMiddleware = void 0;
const constants_1 = require("../../utils/constants");
const SystemOverviewService_1 = __importDefault(require("../../services/SystemOverviewService"));
const Pm2Service_1 = require("../../services/Pm2Service");
const fs_1 = __importDefault(require("fs"));
const websocketUtils_1 = require("../../utils/websocketUtils");
const utils_1 = require("../../utils");
class WebsocketMiddleware {
    constructor() {
        this._io = null;
        this._isSystemMetricsStarted = false;
        this._isPm2EventsStarted = false;
        this._isPm2MetricsStarted = false;
        this.systemInfoIntervalMs = 5000; // Default interval for system info updates
        this.clientsClassifiedByType = {};
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new WebsocketMiddleware();
        }
        return this._instance;
    }
    init(io, systemInfoIntervalMs) {
        this._io = io;
        this.systemInfoIntervalMs = systemInfoIntervalMs || 5000;
        this._io.on("connection", (client) => {
            console.log("New WebSocket connection established from:", client.handshake.address);
            client.on(constants_1.MONITORING_MESSAGE_TYPE, (message) => {
                try {
                    const receivedMessage = typeof message === "string" ? JSON.parse(message) : message;
                    if (!(0, websocketUtils_1.isValidMessage)(receivedMessage))
                        throw new Error("Invalid message format");
                    this.treatClientMessage(client, receivedMessage);
                }
                catch (error) {
                    const message = error.message || "Invalid message format";
                    this.sendError(client, message);
                    return;
                }
            });
        });
    }
    getAllConnectedClients(type) {
        if (this._io) {
            if (type) {
                return this.clientsClassifiedByType[type] || [];
            }
            return Array.from(this._io.sockets.sockets.values());
        }
        return [];
    }
    async treatClientMessage(client, message) {
        let parsedMessage = message;
        if (typeof message === "string") {
            try {
                parsedMessage = JSON.parse(message);
            }
            catch {
                this.sendError(client, "Invalid message format");
                return;
            }
        }
        const requestType = parsedMessage?.type;
        switch (requestType) {
            case constants_1.SYSTEM_METRICS_EVENT_TYPE:
                this._addClientToType(constants_1.SYSTEM_METRICS_EVENT_TYPE, client);
                if (!this._isSystemMetricsStarted) {
                    this._isSystemMetricsStarted = true;
                    this.startSendingSystemMetrics();
                }
                break;
            case utils_1.PM2_METRICS_EVENT_TYPE:
                this._addClientToType(utils_1.PM2_METRICS_EVENT_TYPE, client);
                if (!this._isPm2MetricsStarted) {
                    this._isPm2MetricsStarted = true;
                    this.startSendingPm2Metrics();
                }
                break;
            // Handle PM2 event requests
            case constants_1.PM2_PROCESS_EVENT_TYPE:
                this._addClientToType(constants_1.PM2_PROCESS_EVENT_TYPE, client);
                if (!this._isPm2EventsStarted) {
                    this._isPm2EventsStarted = true;
                    this.startSendingPm2Events();
                }
                break;
            // Handle log stream requests
            case constants_1.LOG_STREAM_EVENT_TYPE: {
                const id = parsedMessage?.data?.id || parsedMessage?.id;
                const process = await Pm2Service_1.Pm2Service.getInstance().getPm2ProcessByKey(id);
                if (!process) {
                    this.sendError(client, `PM2 process not found for id: ${id}`);
                    return;
                }
                const logPath = (0, utils_1.getProcessLogPath)(process, "out"); // Implement this function to retrieve the log path based on the provided id
                if (!logPath) {
                    this.sendError(client, "Missing logPath for PM2 log stream");
                    return;
                }
                if (!fs_1.default.existsSync(logPath)) {
                    this.sendError(client, `Log file does not exist: ${logPath}`);
                    return;
                }
                this._addClientToType(`${constants_1.LOG_STREAM_EVENT_TYPE}:${logPath}`, client);
                this.sendStreamLogsToAllClients(logPath);
                break;
            }
            case constants_1.ZABBIX_PUSH_EVENT_TYPE:
                this._addClientToType(constants_1.ZABBIX_PUSH_EVENT_TYPE, client);
                break;
            default:
                this.sendError(client, "Unknown request type");
        }
    }
    sendError(client, errorMessage) {
        client.emit("error", { type: "error", data: errorMessage });
    }
    _addClientToType(type, client) {
        if (!this.clientsClassifiedByType[type]) {
            this.clientsClassifiedByType[type] = [];
        }
        const foundClient = this.clientsClassifiedByType[type].find((c) => c.id === client.id);
        if (foundClient)
            return;
        this.clientsClassifiedByType[type].push(client);
    }
    startSendingSystemMetrics() {
        const metricsInterval = setInterval(() => {
            const systemOverview = SystemOverviewService_1.default.getInstance();
            const systemMetrics = systemOverview.getSystemMetricsFormatted();
            this._sendDataToAllClients({ type: constants_1.SYSTEM_METRICS_EVENT_TYPE, data: systemMetrics });
        }, this.systemInfoIntervalMs);
    }
    startSendingPm2Metrics() {
        const metricsInterval = setInterval(async () => {
            const pm2Service = Pm2Service_1.Pm2Service.getInstance();
            const pm2Metrics = await pm2Service.getPm2MetricsFormatted();
            this._sendDataToAllClients({ type: utils_1.PM2_METRICS_EVENT_TYPE, data: pm2Metrics });
        }, this.systemInfoIntervalMs);
    }
    async startSendingPm2Events() {
        const pm2Service = Pm2Service_1.Pm2Service.getInstance();
        await pm2Service.listentPm2Actions((event) => {
            if (event.type !== "process:event")
                return;
            this._sendDataToAllClients({
                type: constants_1.PM2_PROCESS_EVENT_TYPE,
                data: {
                    ...event,
                    process: (0, utils_1.formatProcess)(event.process),
                },
            });
        });
    }
    _sendDataToAllClients(message) {
        const clients = this.getAllConnectedClients(message.type);
        if (clients.length > 0) {
            for (const client of clients) {
                // if (client === WebSocket.OPEN) {
                // 	client.send(JSON.stringify(message));
                // }
                client.emit(constants_1.MONITORING_MESSAGE_TYPE, message);
            }
        }
    }
    sendZabbixPushEvent(data) {
        this._sendDataToAllClients({ type: constants_1.ZABBIX_PUSH_EVENT_TYPE, data });
    }
    sendStreamLogsToAllClients(logPath) {
        console.log("Starting to stream logs from:", logPath);
        const logStream = fs_1.default.createReadStream(logPath, { encoding: "utf8", flags: "r" });
        logStream.on("data", (chunk) => {
            this._sendDataToAllClients({ type: `${constants_1.LOG_STREAM_EVENT_TYPE}:${logPath}`, data: chunk });
        });
        fs_1.default.watchFile(logPath, (curr, prev) => {
            const stream = fs_1.default.createReadStream(logPath, { encoding: "utf8", start: logStream.bytesRead });
            stream.on("data", (data) => {
                this._sendDataToAllClients({ type: `${constants_1.LOG_STREAM_EVENT_TYPE}:${logPath}`, data });
            });
        });
    }
}
exports.WebsocketMiddleware = WebsocketMiddleware;
exports.default = WebsocketMiddleware;
//# sourceMappingURL=webSocketMiddleware.js.map
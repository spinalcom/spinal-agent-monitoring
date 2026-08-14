"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketMiddleware = void 0;
const ws_1 = require("ws");
const constants_1 = require("../../utils/constants");
const SystemOverviewService_1 = __importDefault(require("../../services/SystemOverviewService"));
const Pm2Service_1 = require("../../services/Pm2Service");
const config_1 = require("../../utils/config");
const fs_1 = __importDefault(require("fs"));
class WebsocketMiddleware {
    constructor() {
        this._isSystemMetricsStarted = false;
        this._isPm2EventsStarted = false;
        this.clientsClassifiedByType = {};
    }
    set wss(wss) {
        this._wss = wss;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new WebsocketMiddleware();
        }
        return this._instance;
    }
    getAllConnectedClients() {
        if (this._wss) {
            return Array.from(this._wss.clients);
        }
        return [];
    }
    treatClientMessage(ws, message) {
        let parsedMessage = message;
        if (typeof message === "string") {
            try {
                parsedMessage = JSON.parse(message);
            }
            catch {
                this._sendError(ws, "Invalid message format");
                return;
            }
        }
        const requestType = parsedMessage?.type;
        switch (requestType) {
            case constants_1.SYSTEM_METRICS_EVENT_TYPE:
                this._addClientToType(constants_1.SYSTEM_METRICS_EVENT_TYPE, ws);
                if (!this._isSystemMetricsStarted) {
                    this._isSystemMetricsStarted = true;
                    this.startSendingSystemMetrics();
                }
                break;
            case constants_1.PM2_PROCESS_EVENT_TYPE:
                this._addClientToType(constants_1.PM2_PROCESS_EVENT_TYPE, ws);
                if (!this._isPm2EventsStarted) {
                    this._isPm2EventsStarted = true;
                    this.startSendingPm2Events();
                }
                break;
            case constants_1.LOG_STREAM_EVENT_TYPE: {
                const logPath = parsedMessage?.data?.logPath || parsedMessage?.logPath;
                if (!logPath) {
                    this._sendError(ws, "Missing logPath for PM2 log stream");
                    return;
                }
                if (!fs_1.default.existsSync(logPath)) {
                    this._sendError(ws, `Log file does not exist: ${logPath}`);
                    return;
                }
                this._addClientToType(`${constants_1.LOG_STREAM_EVENT_TYPE}:${logPath}`, ws);
                this.sendStreamLogsToAllClients(logPath);
                break;
            }
            case constants_1.ZABBIX_PUSH_EVENT_TYPE:
                this._addClientToType(constants_1.ZABBIX_PUSH_EVENT_TYPE, ws);
                break;
            default:
                ws.send(JSON.stringify({
                    type: "error",
                    data: "Unknown request type",
                }));
        }
    }
    _sendError(ws, errorMessage) {
        ws.send(JSON.stringify({ type: "error", data: errorMessage }));
    }
    _addClientToType(type, ws) {
        if (!this.clientsClassifiedByType[type]) {
            this.clientsClassifiedByType[type] = [];
        }
        if (!this.clientsClassifiedByType[type].includes(ws)) {
            this.clientsClassifiedByType[type].push(ws);
        }
    }
    startSendingSystemMetrics() {
        const intervalMs = config_1.config.monitoringApiConfig.systemInfoIntervalMs || 5000; // Default to 5000ms if not set
        const metricsInterval = setInterval(() => {
            const systemOverview = SystemOverviewService_1.default.getInstance();
            const systemMetrics = systemOverview.getSystemMetricsFormatted();
            this._sendDataToAllClients({ type: constants_1.SYSTEM_METRICS_EVENT_TYPE, data: systemMetrics });
        }, parseInt(intervalMs.toString()));
    }
    async startSendingPm2Events() {
        const pm2Service = Pm2Service_1.Pm2Service.getInstance();
        await pm2Service.listentPm2Actions((event) => {
            this._sendDataToAllClients({ type: constants_1.PM2_PROCESS_EVENT_TYPE, data: event });
        });
    }
    _sendDataToAllClients(message) {
        const clients = this.getAllConnectedClients();
        if (clients.length > 0) {
            for (const client of clients) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
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
//# sourceMappingURL=webSocketMiddleware%20copy.js.map
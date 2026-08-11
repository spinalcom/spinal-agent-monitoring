import { WebSocketServer, WebSocket } from "ws";
import { LOG_STREAM_EVENT_TYPE, PM2_PROCESS_EVENT_TYPE, SYSTEM_METRICS_EVENT_TYPE, ZABBIX_PUSH_EVENT_TYPE } from "../../utils/constants";
import SystemOverviewService from "../../services/SystemOverviewService";
import { Pm2Service } from "../../services/Pm2Service";
import { config } from "../../utils/config";
import fs from "fs";

export class WebsocketMiddleware {
	private static _instance: WebsocketMiddleware;
	private _wss: WebSocketServer;
	private _isSystemMetricsStarted = false;
	private _isPm2EventsStarted = false;

	private clientsClassifiedByType: { [key: string]: WebSocket[] } = {};

	private constructor() {}

	set wss(wss: WebSocketServer) {
		this._wss = wss;
	}

	public static getInstance(): WebsocketMiddleware {
		if (!this._instance) {
			this._instance = new WebsocketMiddleware();
		}
		return this._instance;
	}

	getAllConnectedClients(): WebSocket[] {
		if (this._wss) {
			return Array.from(this._wss.clients) as WebSocket[];
		}
		return [];
	}

	public treatClientMessage(ws: WebSocket, message: any) {
		let parsedMessage = message;

		if (typeof message === "string") {
			try {
				parsedMessage = JSON.parse(message);
			} catch {
				this._sendError(ws, "Invalid message format");
				return;
			}
		}

		const requestType = parsedMessage?.type;

		switch (requestType) {
			case SYSTEM_METRICS_EVENT_TYPE:
				this._addClientToType(SYSTEM_METRICS_EVENT_TYPE, ws);

				if (!this._isSystemMetricsStarted) {
					this._isSystemMetricsStarted = true;
					this.startSendingSystemMetrics();
				}
				break;

			case PM2_PROCESS_EVENT_TYPE:
				this._addClientToType(PM2_PROCESS_EVENT_TYPE, ws);

				if (!this._isPm2EventsStarted) {
					this._isPm2EventsStarted = true;
					this.startSendingPm2Events();
				}
				break;

			case LOG_STREAM_EVENT_TYPE: {
				const logPath = parsedMessage?.data?.logPath || parsedMessage?.logPath;
				if (!logPath) {
					this._sendError(ws, "Missing logPath for PM2 log stream");
					return;
				}

				if (!fs.existsSync(logPath)) {
					this._sendError(ws, `Log file does not exist: ${logPath}`);
					return;
				}

				this._addClientToType(`${LOG_STREAM_EVENT_TYPE}:${logPath}`, ws);
				this.sendStreamLogsToAllClients(logPath);
				break;
			}

			case ZABBIX_PUSH_EVENT_TYPE:
				this._addClientToType(ZABBIX_PUSH_EVENT_TYPE, ws);
				break;

			default:
				ws.send(
					JSON.stringify({
						type: "error",
						data: "Unknown request type",
					}),
				);
		}
	}

	private _sendError(ws: WebSocket, errorMessage: string) {
		ws.send(JSON.stringify({ type: "error", data: errorMessage }));
	}

	private _addClientToType(type: string, ws: WebSocket) {
		if (!this.clientsClassifiedByType[type]) {
			this.clientsClassifiedByType[type] = [];
		}

		if (!this.clientsClassifiedByType[type].includes(ws)) {
			this.clientsClassifiedByType[type].push(ws);
		}
	}

	public startSendingSystemMetrics() {
		const intervalMs = config.monitoringApiConfig.systemInfoIntervalMs || 5000; // Default to 5000ms if not set

		const metricsInterval = setInterval(() => {
			const systemOverview = SystemOverviewService.getInstance();
			const systemMetrics = systemOverview.getSystemMetricsFormatted();
			this._sendDataToAllClients({ type: SYSTEM_METRICS_EVENT_TYPE, data: systemMetrics });
		}, parseInt(intervalMs.toString()));
	}

	public async startSendingPm2Events() {
		const pm2Service = Pm2Service.getInstance();
		await pm2Service.initializePm2Service((event) => {
			this._sendDataToAllClients({ type: PM2_PROCESS_EVENT_TYPE, data: event });
		});
	}

	private _sendDataToAllClients(message: { [key: string]: any }) {
		const clients = this.getAllConnectedClients();
		if (clients.length > 0) {
			for (const client of clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(message));
				}
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

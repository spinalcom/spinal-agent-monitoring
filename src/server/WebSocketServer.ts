import { WebSocketServer } from "ws";
import WebsocketMiddleware from "./middleware/webSocketMiddleware";
import { LOG_STREAM_EVENT_TYPE, PM2_EVENT_TYPE, websocketEventTypes } from "../utils/constants";

export function runWebSocketServer(server: any) {
	const wss = new WebSocketServer({ server });
	const websocketMiddleware = WebsocketMiddleware.getInstance();

	websocketMiddleware.wss = wss;

	wss.on("connection", (ws, request) => {
		console.log("New WebSocket connection established from:", request.socket.remoteAddress);

		ws.on("message", (message) => {
			try {
				const receivedMessage = message.toString();

				if (!isValidMessage(receivedMessage)) throw new Error("Invalid message format");

				websocketMiddleware.treatClientMessage(ws, receivedMessage);
			} catch (error: Error | any) {
				const data = { message: error.message || "Invalid message format" };
				ws.send(JSON.stringify({ type: "error", data }));
				return;
			}
		});

		ws.on("close", () => {
			console.log("WebSocket connection closed from:", request.socket.remoteAddress);
		});

		ws.on("error", (error) => {
			console.error("WebSocket error:", error);
		});
	});

	// Set the WebSocketServer instance in the middleware
	// websocketMiddleware.wss = wss;
	// websocketMiddleware.startSendingSystemMetrics(); // Start sending system metrics to connected clients
	// websocketMiddleware.startSendingPm2Events(); // Start sending PM2 events to connected clients
	// websocketMiddleware.sendStreamLogsToAllClients("/home/spinalcom/.pm2/logs/spinal-core-hub-8010-out.log");
}

function isValidMessage(message: any): boolean {
	try {
		if (typeof message === "string") message = JSON.parse(message);

		if (typeof message !== "object" || message === null) return false;
		if (!("type" in message) || !websocketEventTypes.includes(message.type)) return false;
		if (!isValidDataForType(message.type, message.data)) return false;
		return true;
	} catch (error) {
		return false;
	}
}

function isValidDataForType(type: string, data: any): boolean {
	switch (type) {
		case PM2_EVENT_TYPE:
			return typeof data === "object" && ["number", "string"].includes(typeof data.id);
		case LOG_STREAM_EVENT_TYPE:
			return typeof data === "object" && typeof data.path === "string";
		default:
			return true; // For other types, assume valid for now
	}
}

export default runWebSocketServer;

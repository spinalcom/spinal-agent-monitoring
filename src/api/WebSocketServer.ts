import WebsocketMiddleware from "./middleware/webSocketMiddleware";
import { Server as SocketIOServer } from "socket.io";

export function runWebSocketServer(server: any) {
	const io = new SocketIOServer(server);
	const websocketMiddleware = WebsocketMiddleware.getInstance();

	websocketMiddleware.init(io); // Set the Socket.IO instance in the middleware
}

export default runWebSocketServer;

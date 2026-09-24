"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWebSocketServer = runWebSocketServer;
const webSocketMiddleware_1 = __importDefault(require("./middleware/webSocketMiddleware"));
const socket_io_1 = require("socket.io");
function runWebSocketServer(server) {
    const io = new socket_io_1.Server(server);
    const websocketMiddleware = webSocketMiddleware_1.default.getInstance();
    websocketMiddleware.init(io); // Set the Socket.IO instance in the middleware
}
exports.default = runWebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map
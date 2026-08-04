import { WebSocketServer, WebSocket } from "ws";
export declare class WebsocketMiddleware {
    private static _instance;
    private _wss;
    private _isSystemMetricsStarted;
    private _isPm2EventsStarted;
    private clientsClassifiedByType;
    private constructor();
    set wss(wss: WebSocketServer);
    static getInstance(): WebsocketMiddleware;
    getAllConnectedClients(): WebSocket[];
    treatClientMessage(ws: WebSocket, message: any): void;
    private _sendError;
    private _addClientToType;
    startSendingSystemMetrics(): void;
    startSendingPm2Events(): Promise<void>;
    private _sendDataToAllClients;
    sendZabbixPushEvent(data: {
        [key: string]: any;
    }): void;
    sendStreamLogsToAllClients(logPath: string): void;
}
export default WebsocketMiddleware;

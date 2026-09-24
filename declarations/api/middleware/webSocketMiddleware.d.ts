import { Server, Socket } from "socket.io";
export declare class WebsocketMiddleware {
    private static _instance;
    private _io;
    private _isSystemMetricsStarted;
    private _isPm2EventsStarted;
    private _isPm2MetricsStarted;
    private systemInfoIntervalMs;
    private clientsClassifiedByType;
    private constructor();
    static getInstance(): WebsocketMiddleware;
    init(io: Server, systemInfoIntervalMs?: number): void;
    getAllConnectedClients(type?: string): Socket[];
    treatClientMessage(client: Socket, message: any): Promise<void>;
    sendError(client: Socket, errorMessage: string): void;
    private _addClientToType;
    startSendingSystemMetrics(): void;
    startSendingPm2Metrics(): void;
    startSendingPm2Events(): Promise<void>;
    private _sendDataToAllClients;
    sendZabbixPushEvent(data: {
        [key: string]: any;
    }): void;
    sendStreamLogsToAllClients(logPath: string): void;
}
export default WebsocketMiddleware;

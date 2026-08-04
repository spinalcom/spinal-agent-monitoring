import { ProcessDescription } from "pm2";
type ZabbixMetric = {
    key: string;
    value: number | string;
};
type PushTransport = "tcp";
type ZabbixPushUpdate = {
    transport?: PushTransport;
    message?: string;
    host: string;
    metricsCount: number;
    timestamp: number;
    metrics?: ZabbixMetric[];
};
type Pm2Discovery = {
    data: Array<{
        "{#PROCNAME}": string;
        "{#PMID}": string;
    }>;
};
declare class ZabbixSenderService {
    private _updateIntervalMs;
    private isFlushing;
    private _agentHostName;
    private static _instance;
    private readonly systemOverviewService;
    private readonly pm2Service;
    private intervalHandle;
    private retryHandle;
    private readonly queue;
    private hostTargets;
    private pushUpdateCallback;
    private constructor();
    static getInstance(): ZabbixSenderService;
    startPeriodicPush(onPushUpdate?: (update: ZabbixPushUpdate) => void): Promise<void>;
    stopPeriodicPush(): void;
    getPm2Discovery(processes?: ProcessDescription[]): Promise<Pm2Discovery>;
    private enqueueAndFlushCurrentSnapshot;
    private flushQueue;
    private _buildMetricsPayload;
    private _sendDataToZabbixServers;
    private notifyPushUpdate;
    private sendWithZabbixTcp;
    private buildZabbixPacket;
    private validateZabbixResponse;
}
export { ZabbixSenderService, ZabbixMetric, Pm2Discovery, ZabbixPushUpdate };
export default ZabbixSenderService;

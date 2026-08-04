export declare const SPINAL_COMMAND_TYPE: {
    readonly start: "start";
    readonly restart: "restart";
    readonly stop: "stop";
};
export declare const SPINAL_COMMAND_STATUS: {
    readonly pending: "pending";
    readonly in_progress: "in_progress";
    readonly completed: "completed";
    readonly failed: "failed";
};
export declare const SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
export declare const PM2_EVENT_TYPE = "pm2Event";
export declare const LOG_STREAM_EVENT_TYPE = "logStream";
export declare const ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";
export declare const websocketEventTypes: readonly ["systemMetrics", "pm2Event", "logStream", "zabbixPush"];

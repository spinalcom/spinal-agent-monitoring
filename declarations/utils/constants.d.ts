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
export declare const MONITORING_MESSAGE_TYPE = "monitoring_message";
export declare const SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
export declare const PM2_PROCESS_EVENT_TYPE = "pm2ProcessEvent";
export declare const LOG_STREAM_EVENT_TYPE = "logStream";
export declare const ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";
export declare const PM2_METRICS_EVENT_TYPE = "pm2Metrics";
export declare const websocketEventTypes: readonly ["systemMetrics", "pm2ProcessEvent", "logStream", "zabbixPush", "pm2Metrics"];
export declare const SYSTEM_METRICS_NODE_TYPE = "SystemMetrics";
export declare const PM2_PROCESS_NODE_TYPE = "Pm2Process";
export declare const PM2_PROCESS_CONTEXT_TYPE = "Pm2ProcessContext";
export declare const PM2_LOG_NODE_TYPE = "pm2Log";
export declare const SYSTEM_METRICS_NODE_NAME = "SystemMetrics";
export declare const PM2_PROCESS_CONTEXT_NAME = "Pm2ProcessContext";
export declare const HAS_PM2_PROCESS_RELATION_NAME = "hasPm2Process";
export declare const HAS_LOG = "hasLogFile";

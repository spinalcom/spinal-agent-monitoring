export const SPINAL_COMMAND_TYPE = {
	start: "start",
	restart: "restart",
	stop: "stop",
} as const;

export const SPINAL_COMMAND_STATUS = {
	pending: "pending",
	in_progress: "in_progress",
	completed: "completed",
	failed: "failed",
} as const;

export const MONITORING_MESSAGE_TYPE = "monitoring_message";
export const SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
export const PM2_PROCESS_EVENT_TYPE = "pm2ProcessEvent";
export const LOG_STREAM_EVENT_TYPE = "logStream";
export const ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";
export const PM2_METRICS_EVENT_TYPE = "pm2Metrics";

export const websocketEventTypes = [SYSTEM_METRICS_EVENT_TYPE, PM2_PROCESS_EVENT_TYPE, LOG_STREAM_EVENT_TYPE, ZABBIX_PUSH_EVENT_TYPE, PM2_METRICS_EVENT_TYPE] as const;

// node types
export const SYSTEM_METRICS_NODE_TYPE = "SystemMetrics";
export const PM2_PROCESS_NODE_TYPE = "Pm2Process";
export const PM2_PROCESS_CONTEXT_TYPE = "Pm2ProcessContext";
export const PM2_LOG_NODE_TYPE = "pm2Log";

// node names
export const SYSTEM_METRICS_NODE_NAME = "SystemMetrics";
export const PM2_PROCESS_CONTEXT_NAME = "Pm2ProcessContext";

// relation names
export const HAS_PM2_PROCESS_RELATION_NAME = "hasPm2Process";
export const HAS_LOG = "hasLogFile";

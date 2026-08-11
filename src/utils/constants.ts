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

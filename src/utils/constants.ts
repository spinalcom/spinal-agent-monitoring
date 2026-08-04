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

export const SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
export const PM2_EVENT_TYPE = "pm2Event";
export const LOG_STREAM_EVENT_TYPE = "logStream";
export const ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";

export const websocketEventTypes = [SYSTEM_METRICS_EVENT_TYPE, PM2_EVENT_TYPE, LOG_STREAM_EVENT_TYPE, ZABBIX_PUSH_EVENT_TYPE] as const;

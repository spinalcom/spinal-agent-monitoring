import { time } from "console";
import { InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType } from "spinal-model-bmsnetwork";

export const SPINAL_COMMAND_TYPE = {
	start: "start",
	restart: "restart",
	stop: "stop",
	online: "online",
	exit: "exit",
} as const;

export const SPINAL_COMMAND_STATUS = {
	pending: "pending",
	in_progress: "in_progress",
	completed: "completed",
	failed: "failed",
	timeout: "timeout",
} as const;

export const MONITORING_MESSAGE_TYPE = "monitoring_message";
export const SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
export const PM2_PROCESS_EVENT_TYPE = "pm2ProcessEvent";
export const LOG_STREAM_EVENT_TYPE = "logStream";
export const ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";
export const PM2_METRICS_EVENT_TYPE = "pm2Metrics";

export const websocketEventTypes = [SYSTEM_METRICS_EVENT_TYPE, PM2_PROCESS_EVENT_TYPE, LOG_STREAM_EVENT_TYPE, ZABBIX_PUSH_EVENT_TYPE, PM2_METRICS_EVENT_TYPE] as const;

// node types
export const VM_CONTEXT_NODE_TYPE = "VirtualMachineContext";
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

export const PM2_PROCESS_STATES = {
	0: "stopped",
	1: "online",
	2: "errored",
	3: "restart", // Note: This seems to be a duplicate of 0, consider reviewing this mapping

	// textual representation of the states
	stopped: 0,
	online: 1,
	errored: 2,
	restart: 3,
} as const;

export const PM2_ENDPOINTS: { readonly [key: string]: InputDataEndpoint } = {
	RAM_HISTORY: {
		id: "2",
		name: "ram_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	ERRORED_HISTORY: {
		id: "3",
		name: "errored_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	REBOOT_HISTORY: {
		id: "3",
		name: "reboot_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	HEAP_SIZE_HISTORY: {
		id: "6",
		name: "heap_size_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	HEAP_USAGE_HISTORY: {
		id: "7",
		name: "heap_usage_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	HEAP_USED_SIZE_HISTORY: {
		id: "8",
		name: "heap_used_size_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},

	CPU_HISTORY: {
		id: "5",
		name: "cpu_history",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
	},
};

export const METRICS_ENDPOINTS = {
	CPU_USAGE: {
		id: "1",
		name: "cpu_usage",
		path: "",
		currentValue: 0,
		unit: "",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
		maxValue: Infinity,
		minValue: 0,
	},

	RAM_USAGE: {
		id: "2",
		name: "ram_usage",
		path: "",
		currentValue: 0,
		unit: "%",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
		maxValue: Infinity,
		minValue: 0,
	},

	DISK_USAGE: {
		id: "3",
		name: "disk_usage",
		path: "",
		currentValue: 0,
		unit: "%",
		nodeTypeName: "BmsEndpoint",
		dataType: InputDataEndpointDataType.Integer,
		type: InputDataEndpointType.Other,
		maxValue: Infinity,
		minValue: 0,
	},
};

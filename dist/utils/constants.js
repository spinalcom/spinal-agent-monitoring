"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRICS_ENDPOINTS = exports.PM2_ENDPOINTS = exports.PM2_PROCESS_STATES = exports.HAS_LOG = exports.HAS_PM2_PROCESS_RELATION_NAME = exports.PM2_PROCESS_CONTEXT_NAME = exports.SYSTEM_METRICS_NODE_NAME = exports.PM2_LOG_NODE_TYPE = exports.PM2_PROCESS_CONTEXT_TYPE = exports.PM2_PROCESS_NODE_TYPE = exports.SYSTEM_METRICS_NODE_TYPE = exports.VM_CONTEXT_NODE_TYPE = exports.websocketEventTypes = exports.PM2_METRICS_EVENT_TYPE = exports.ZABBIX_PUSH_EVENT_TYPE = exports.LOG_STREAM_EVENT_TYPE = exports.PM2_PROCESS_EVENT_TYPE = exports.SYSTEM_METRICS_EVENT_TYPE = exports.MONITORING_MESSAGE_TYPE = exports.SPINAL_COMMAND_STATUS = exports.SPINAL_COMMAND_TYPE = void 0;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
exports.SPINAL_COMMAND_TYPE = {
    start: "start",
    restart: "restart",
    stop: "stop",
    online: "online",
    exit: "exit",
};
exports.SPINAL_COMMAND_STATUS = {
    pending: "pending",
    in_progress: "in_progress",
    completed: "completed",
    failed: "failed",
};
exports.MONITORING_MESSAGE_TYPE = "monitoring_message";
exports.SYSTEM_METRICS_EVENT_TYPE = "systemMetrics";
exports.PM2_PROCESS_EVENT_TYPE = "pm2ProcessEvent";
exports.LOG_STREAM_EVENT_TYPE = "logStream";
exports.ZABBIX_PUSH_EVENT_TYPE = "zabbixPush";
exports.PM2_METRICS_EVENT_TYPE = "pm2Metrics";
exports.websocketEventTypes = [exports.SYSTEM_METRICS_EVENT_TYPE, exports.PM2_PROCESS_EVENT_TYPE, exports.LOG_STREAM_EVENT_TYPE, exports.ZABBIX_PUSH_EVENT_TYPE, exports.PM2_METRICS_EVENT_TYPE];
// node types
exports.VM_CONTEXT_NODE_TYPE = "VirtualMachineContext";
exports.SYSTEM_METRICS_NODE_TYPE = "SystemMetrics";
exports.PM2_PROCESS_NODE_TYPE = "Pm2Process";
exports.PM2_PROCESS_CONTEXT_TYPE = "Pm2ProcessContext";
exports.PM2_LOG_NODE_TYPE = "pm2Log";
// node names
exports.SYSTEM_METRICS_NODE_NAME = "SystemMetrics";
exports.PM2_PROCESS_CONTEXT_NAME = "Pm2ProcessContext";
// relation names
exports.HAS_PM2_PROCESS_RELATION_NAME = "hasPm2Process";
exports.HAS_LOG = "hasLogFile";
exports.PM2_PROCESS_STATES = {
    0: "stopped",
    1: "online",
    2: "errored",
    3: "restart", // Note: This seems to be a duplicate of 0, consider reviewing this mapping
    // textual representation of the states
    stopped: 0,
    online: 1,
    errored: 2,
    restart: 3,
};
exports.PM2_ENDPOINTS = {
    RAM_HISTORY: {
        id: "2",
        name: "ram_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    ERRORED_HISTORY: {
        id: "3",
        name: "errored_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    REBOOT_HISTORY: {
        id: "3",
        name: "reboot_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    HEAP_SIZE_HISTORY: {
        id: "6",
        name: "heap_size_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    HEAP_USAGE_HISTORY: {
        id: "7",
        name: "heap_usage_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    HEAP_USED_SIZE_HISTORY: {
        id: "8",
        name: "heap_used_size_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
    CPU_HISTORY: {
        id: "5",
        name: "cpu_history",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
    },
};
exports.METRICS_ENDPOINTS = {
    CPU_USAGE: {
        id: "1",
        name: "cpu_usage",
        path: "",
        currentValue: 0,
        unit: "",
        nodeTypeName: "BmsEndpoint",
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
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
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
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
        dataType: spinal_model_bmsnetwork_1.InputDataEndpointDataType.Integer,
        type: spinal_model_bmsnetwork_1.InputDataEndpointType.Other,
        maxValue: Infinity,
        minValue: 0,
    },
};
//# sourceMappingURL=constants.js.map
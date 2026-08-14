"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAS_LOG = exports.HAS_PM2_PROCESS_RELATION_NAME = exports.PM2_PROCESS_CONTEXT_NAME = exports.SYSTEM_METRICS_NODE_NAME = exports.PM2_LOG_NODE_TYPE = exports.PM2_PROCESS_CONTEXT_TYPE = exports.PM2_PROCESS_NODE_TYPE = exports.SYSTEM_METRICS_NODE_TYPE = exports.websocketEventTypes = exports.PM2_METRICS_EVENT_TYPE = exports.ZABBIX_PUSH_EVENT_TYPE = exports.LOG_STREAM_EVENT_TYPE = exports.PM2_PROCESS_EVENT_TYPE = exports.SYSTEM_METRICS_EVENT_TYPE = exports.MONITORING_MESSAGE_TYPE = exports.SPINAL_COMMAND_STATUS = exports.SPINAL_COMMAND_TYPE = void 0;
exports.SPINAL_COMMAND_TYPE = {
    start: "start",
    restart: "restart",
    stop: "stop",
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
//# sourceMappingURL=constants.js.map
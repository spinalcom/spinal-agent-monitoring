"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketEventTypes = exports.PM2_METRICS_EVENT_TYPE = exports.ZABBIX_PUSH_EVENT_TYPE = exports.LOG_STREAM_EVENT_TYPE = exports.PM2_PROCESS_EVENT_TYPE = exports.SYSTEM_METRICS_EVENT_TYPE = exports.MONITORING_MESSAGE_TYPE = exports.SPINAL_COMMAND_STATUS = exports.SPINAL_COMMAND_TYPE = void 0;
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
//# sourceMappingURL=constants.js.map
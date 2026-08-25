"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const tsoa_1 = require("tsoa");
const Pm2Service_1 = require("../../services/Pm2Service");
const SystemOverviewService_1 = __importDefault(require("../../services/SystemOverviewService"));
const ZabbixSenderService_1 = __importDefault(require("../../services/ZabbixSenderService"));
const pm2Utils_1 = require("../../utils/pm2Utils");
const HTTP_RESPONSE_1 = require("../../utils/HTTP_RESPONSE");
let MonitoringController = class MonitoringController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.pm2Service = Pm2Service_1.Pm2Service.getInstance();
        this.systemOverviewService = SystemOverviewService_1.default.getInstance();
        this.zabbixSenderService = ZabbixSenderService_1.default.getInstance();
    }
    /**
     * Returns a simple health status to confirm the monitoring API is reachable.
     */
    getHealth() {
        try {
            return { status: "ok" };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { status: HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve health status" };
        }
    }
    /**
     * Returns current CPU, memory, and system-level metrics collected by the agent.
     */
    getSystemMetrics() {
        try {
            return this.systemOverviewService.getSystemMetricsFormatted();
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { status: HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve system metrics" };
        }
    }
    /**
     * Lists all PM2-managed applications with their current runtime state.
     */
    async getApps() {
        try {
            const processes = await this.pm2Service.getAllPm2Processes();
            return processes.map((process) => (0, pm2Utils_1.formatProcess)(process));
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 processes" };
        }
    }
    /**
     * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
     */
    async getAppsMetrics() {
        try {
            return await this.pm2Service.getPm2MetricsFormatted();
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 metrics" };
        }
    }
    /**
     * Returns PM2 process counts grouped by status.
     */
    async getAppsStatusSummary() {
        try {
            return await this.pm2Service.getPm2StatusSummary();
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 status summary" };
        }
    }
    /**
     * Returns details for a single PM2 application by name or identifier key.
     * @param key PM2 process key used to find the app.
     */
    async getAppByKey(key) {
        try {
            const process = await this.pm2Service.getPm2ProcessByKey(key);
            if (!process) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            return (0, pm2Utils_1.formatProcess)(process);
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 process" };
        }
    }
    /**
     * Returns PM2 runtime metrics for one application.
     * @param key PM2 process key used to find the app.
     */
    async getAppMetricsByKey(key) {
        try {
            const metrics = await this.pm2Service.getPm2ProcessMetricsByKey(key);
            if (!metrics) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            return metrics;
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 process metrics" };
        }
    }
    /**
     * Returns tailed stdout/stderr logs for one PM2 application.
     * @param key PM2 process key used to find the app.
     * @param tail Number of lines to return per stream (1..1000).
     * @param logType Which stream to return: out, err, or all.
     */
    async getAppLogsByKey(key, tail = 100, logType = "all") {
        try {
            const logs = await this.pm2Service.getPm2ProcessLogsByKey(key, tail, logType);
            if (!logs) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            return logs;
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 process logs" };
        }
    }
    /**
     * Starts one or more PM2 applications.
     * @param data Request body containing the list of application keys to start.
     */
    async startApp(data) {
        try {
            const result = await this.pm2Service.startPm2Process(data.keys);
            return (0, pm2Utils_1.partitionResults)(result, "started");
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to start PM2 process" };
        }
    }
    /**
     * Stops one or more PM2 applications.
     * @param data Request body containing the list of application keys to stop.
     */
    async stopApp(data) {
        try {
            const result = await this.pm2Service.stopPm2Process(data.keys);
            return (0, pm2Utils_1.partitionResults)(result, "stopped");
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to stop PM2 process" };
        }
    }
    /**
     * Restarts one or more PM2 applications.
     * @param data Request body containing the list of application keys to restart.
     */
    async restartApp(data) {
        try {
            const result = await this.pm2Service.restartPm2Process(data.keys);
            return (0, pm2Utils_1.partitionResults)(result, "restarted");
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to restart PM2 process" };
        }
    }
    /**
     * Reloads one or more PM2 applications.
     * @param data Request body containing the list of application keys to reload.
     */
    async reloadApp(data) {
        try {
            const result = await this.pm2Service.reloadPm2Process(data.keys);
            return (0, pm2Utils_1.partitionResults)(result, "reloaded");
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to reload PM2 process" };
        }
    }
    /**
     * Deletes one or more PM2 applications from the process list.
     * @param data Request body containing the list of application keys to delete.
     */
    async deleteApp(data) {
        try {
            const result = await this.pm2Service.deletePm2Process(data.keys);
            return (0, pm2Utils_1.partitionResults)(result, "deleted");
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to delete PM2 process" };
        }
    }
    /**
     * Executes a PM2 action across one or more applications.
     * @param data Request body containing action and target keys.
     */
    async runPm2Action(data) {
        try {
            if (!Array.isArray(data.keys) || data.keys.length === 0) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "keys must be a non-empty array" };
            }
            const result = await this.pm2Service.runPm2Action(data.action, data.keys);
            const { success, failed } = (0, pm2Utils_1.splitActionResults)(result);
            return {
                action: data.action,
                done: success,
                failed,
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to execute PM2 action" };
        }
    }
    /**
     * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
     */
    async getZabbixDiscovery() {
        try {
            return await this.zabbixSenderService.getPm2Discovery();
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to build PM2 discovery payload" };
        }
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, tsoa_1.Get)("health"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, tsoa_1.Get)("system"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MonitoringController.prototype, "getSystemMetrics", null);
__decorate([
    (0, tsoa_1.Get)("apps"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getApps", null);
__decorate([
    (0, tsoa_1.Get)("apps/metrics"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppsMetrics", null);
__decorate([
    (0, tsoa_1.Get)("apps/status/summary"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppsStatusSummary", null);
__decorate([
    (0, tsoa_1.Get)("apps/{key}"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppByKey", null);
__decorate([
    (0, tsoa_1.Get)("apps/{key}/metrics"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppMetricsByKey", null);
__decorate([
    (0, tsoa_1.Get)("apps/{key}/logs"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppLogsByKey", null);
__decorate([
    (0, tsoa_1.Post)("apps/start"),
    (0, tsoa_1.Response)(400, "Unable to start process"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "startApp", null);
__decorate([
    (0, tsoa_1.Post)("apps/stop"),
    (0, tsoa_1.Response)(400, "Unable to stop process"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "stopApp", null);
__decorate([
    (0, tsoa_1.Post)("apps/restart"),
    (0, tsoa_1.Response)(400, "Unable to restart process"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "restartApp", null);
__decorate([
    (0, tsoa_1.Post)("apps/reload"),
    (0, tsoa_1.Response)(400, "Unable to reload process"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "reloadApp", null);
__decorate([
    (0, tsoa_1.Post)("apps/delete"),
    (0, tsoa_1.Response)(400, "Unable to delete process"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "deleteApp", null);
__decorate([
    (0, tsoa_1.Post)("apps/action"),
    (0, tsoa_1.Response)(400, "Invalid PM2 action payload"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "runPm2Action", null);
__decorate([
    (0, tsoa_1.Get)("zabbix/discovery"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getZabbixDiscovery", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, tsoa_1.Route)("monitoring"),
    (0, tsoa_1.Tags)("Monitoring")
], MonitoringController);
//# sourceMappingURL=MonitoringController.js.map
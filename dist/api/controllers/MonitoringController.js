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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const tsoa_1 = require("tsoa");
const GraphService_1 = require("../services/GraphService");
const pm2Utils_1 = require("../../utils/pm2Utils");
const HTTP_RESPONSE_1 = require("../../utils/HTTP_RESPONSE");
let MonitoringController = class MonitoringController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.graphService = GraphService_1.GraphService.getInstance();
    }
    // private readonly pm2Service = Pm2Service.getInstance();
    // private readonly systemOverviewService = SystemOverviewService.getInstance();
    // private readonly zabbixSenderService = ZabbixSenderService.getInstance();
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
    async getAllVirtualMachines() {
        try {
            const vms = await this.graphService.getAllVirtualMachines();
            const result = vms.map((vm) => this._formatVmNode(vm));
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return result;
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve virtual machines" };
        }
    }
    async getVirtualMachine(vmKey) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const result = this._formatVmNode(vm);
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return result;
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve virtual machine" };
        }
    }
    /**
     * Returns current CPU, memory, and system-level metrics collected by the agent.
     */
    async getSystemMetrics(vmKey) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const systemMetrics = this._formatVmNode(vm);
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return systemMetrics;
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { status: HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve system metrics" };
        }
    }
    /**
     * Lists all PM2-managed applications with their current runtime state.
     */
    async getApps(vmKey) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processes = await this.graphService.getPm2ProcessesNodes(vm);
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return processes.map((process) => this._formatPm2Process(process));
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 processes" };
        }
    }
    /**
     * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
     */
    async getAppsMetrics(vmKey) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processes = await this.graphService.getPm2ProcessesNodes(vm);
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return processes.map((process) => {
                const info = process.info.get();
                return {
                    pm_id: info.pm_id,
                    status: info.status,
                    restarts: info.restarts,
                    uptime: info.uptime,
                    heapMemory: info.heapMemory,
                    monit: info.monit,
                    cwd: info.cwd,
                    created_at: info.created_at,
                    log: info.log,
                };
            });
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve PM2 metrics" };
        }
    }
    /**
     * Returns PM2 process counts grouped by status.
     */
    async getAppsStatusSummary(vmKey) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processes = await this.graphService.getPm2ProcessesNodes(vm);
            const summary = processes.reduce((acc, process) => {
                const status = process.info.get().status;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return summary;
            // void vmKey;
            // return await this.pm2Service.getPm2StatusSummary();
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
    async getAppByKey(vmKey, key) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
            return this._formatPm2Process(processNode);
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
    async getAppMetricsByKey(vmKey, key) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            const metrics = this._formatPm2ProcessMetrics(processNode);
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
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
    async getAppLogsByKey(vmKey, key, tail = 100, logType = "all") {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm)
                throw new Error("Virtual machine not found");
            const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            const logs = await this.graphService.getPm2ProcessLogsByKey(processNode, tail, logType);
            if (!logs) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
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
    async startApp(vmKey, data) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                throw new Error("Virtual machine not found");
            }
            return this.graphService
                .executeCommand(vm, "start", data.keys)
                .then((results) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
                return (0, pm2Utils_1.partitionResults)(results, "started");
            })
                .catch((err) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: err.message || "Unable to start PM2 process" };
            });
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
    async stopApp(vmKey, data) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                throw new Error("Virtual machine not found");
            }
            return this.graphService
                .executeCommand(vm, "stop", data.keys)
                .then((results) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
                return (0, pm2Utils_1.partitionResults)(results, "stopped");
            })
                .catch((err) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: err.message || "Unable to stop PM2 process" };
            });
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
    async restartApp(vmKey, data) {
        try {
            void vmKey;
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                throw new Error("Virtual machine not found");
            }
            return this.graphService
                .executeCommand(vm, "restart", data.keys)
                .then((results) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
                return (0, pm2Utils_1.partitionResults)(results, "restarted");
            })
                .catch((err) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: err.message || "Unable to restart PM2 process" };
            });
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
    async reloadApp(vmKey, data) {
        try {
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                throw new Error("Virtual machine not found");
            }
            return this.graphService
                .executeCommand(vm, "reload", data.keys)
                .then((results) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
                return (0, pm2Utils_1.partitionResults)(results, "reloaded");
            })
                .catch((err) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: err.message || "Unable to reload PM2 process" };
            });
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
    async deleteApp(vmKey, data) {
        try {
            void vmKey;
            const vm = await this.graphService.getVirtualMachine(vmKey);
            if (!vm) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                throw new Error("Virtual machine not found");
            }
            return this.graphService
                .executeCommand(vm, "delete", data.keys)
                .then((results) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.OK.code);
                return (0, pm2Utils_1.partitionResults)(results, "deleted");
            })
                .catch((err) => {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: err.message || "Unable to delete PM2 process" };
            });
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
    // @Post("{vmKey}/apps/action")
    // @Response<ErrorResponse>(400, "Invalid PM2 action payload")
    // public async runPm2Action(@Path() vmKey: string, @Body() data: { action: "start" | "stop" | "restart" | "reload" | "delete"; keys: (string | number)[] }): Promise<{ action: string; done: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
    // 	try {
    // 		const vm = await this.graphService.getVirtualMachine(vmKey);
    // 		if (!vm) {
    // 			this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
    // 			throw new Error("Virtual machine not found");
    // 		}
    // 		return this.graphService
    // 			.executeCommand(vm, data.action, data.keys)
    // 			.then((results) => {
    // 				this.setStatus(HTTP_RESPONSES.OK.code);
    // 				const dataResult = partitionResults(results, `${data.action}ed`);
    // 				return {
    // 					action: data.action,
    // 					done: dataResult.done || [],
    // 					failed: dataResult.failed || [],
    // 				};
    // 			})
    // 			.catch((err) => {
    // 				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
    // 				return { error: err.message || `Unable to ${data.action} PM2 process` };
    // 			});
    // 	} catch (error: Error | any) {
    // 		this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
    // 		return { error: error.message || "Unable to execute PM2 action" };
    // 	}
    // }
    /**
     * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
     */
    // @Get("{vmKey}/zabbix/discovery")
    // @SuccessResponse("200", "OK")
    // public async getZabbixDiscovery(@Path() vmKey: string): Promise<Pm2Discovery | ErrorResponse> {
    // 	try {
    // 		void vmKey;
    // 		return await this.zabbixSenderService.getPm2Discovery();
    // 	} catch (error: Error | any) {
    // 		this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
    // 		return { error: error.message || "Unable to build PM2 discovery payload" };
    // 	}
    // }
    _formatVmNode(vmNode) {
        const info = vmNode.info.get();
        return {
            name: info.name,
            type: info.type,
            staticId: info.id,
            dynamicId: vmNode._server_id,
            macAddress: info.macAddress,
            ipAddress: info.ipAddress,
            port: info.port,
            cpuUsage: info.cpuUsage,
            ramUsagePercent: info.ramUsagePercent,
            ramUsage: info.ramUsage,
            totalRam: info.totalRam,
            freeRam: info.freeRam,
            totalDisk: info.totalDisk,
            freeDisk: info.freeDisk,
            diskUsage: info.diskUsage,
            diskUsagePercent: info.diskUsagePercent,
        };
    }
    _formatPm2Process(pm2Process) {
        const info = pm2Process.info.get();
        return {
            name: info.name,
            staticId: info.staticId,
            dynamicId: info.dynamicId,
            pm_id: info.pm_id,
            status: info.status,
            restarts: info.restarts,
            uptime: info.uptime,
            heapMemory: info.heapMemory,
            monit: info.monit,
            cwd: info.cwd,
        };
    }
    _formatPm2ProcessMetrics(pm2Process) {
        const info = pm2Process.info.get();
        return {
            name: info.name,
            pm_id: info.pm_id,
            status: info.status,
            cpu: info.monit.cpu,
            memory: info.monit.memory,
            uptime: info.uptime,
            restarts: info.restarts,
        };
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, tsoa_1.Get)("/health"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, tsoa_1.Get)("/all_vms"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAllVirtualMachines", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getVirtualMachine", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/system"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSystemMetrics", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getApps", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps/metrics"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppsMetrics", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps/status/summary"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppsStatusSummary", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps/{key}"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppByKey", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps/{key}/metrics"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppMetricsByKey", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/apps/{key}/logs"),
    (0, tsoa_1.Response)(404, "Process not found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAppLogsByKey", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/apps/start"),
    (0, tsoa_1.Response)(400, "Unable to start process"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "startApp", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/apps/stop"),
    (0, tsoa_1.Response)(400, "Unable to stop process"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "stopApp", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/apps/restart"),
    (0, tsoa_1.Response)(400, "Unable to restart process"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "restartApp", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/apps/reload"),
    (0, tsoa_1.Response)(400, "Unable to reload process"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "reloadApp", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/apps/delete"),
    (0, tsoa_1.Response)(400, "Unable to delete process"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "deleteApp", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, tsoa_1.Route)("monitoring"),
    (0, tsoa_1.Tags)("Monitoring")
], MonitoringController);
//# sourceMappingURL=MonitoringController.js.map
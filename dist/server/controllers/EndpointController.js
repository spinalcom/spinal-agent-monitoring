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
exports.EndpointController = void 0;
const tsoa_1 = require("tsoa");
const EndpointUtils_1 = __importDefault(require("../../services/EndpointUtils"));
const SpinalGraphService_1 = __importDefault(require("../../services/SpinalGraphService"));
const HTTP_RESPONSE_1 = require("../../utils/HTTP_RESPONSE");
const constants_1 = require("../../utils/constants");
let EndpointController = class EndpointController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.endpointUtils = EndpointUtils_1.default.getInstance();
        this.spinalGraphService = SpinalGraphService_1.default.getInstance();
    }
    async getPm2RamHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.RAM_HISTORY.name);
    }
    async getPm2RamHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.RAM_HISTORY.name, startTime, endTime);
    }
    async getPm2CpuHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.CPU_HISTORY.name);
    }
    async getPm2CpuHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.CPU_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapSizeHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
    }
    async getPm2HeapSizeHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapUsageHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
    }
    async getPm2HeapUsageHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapUsedSizeHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);
    }
    async getPm2HeapUsedSizeHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name, startTime, endTime);
    }
    async getPm2RebootHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name);
    }
    async getPm2RebootHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name, startTime, endTime);
    }
    async getPm2ErroredHistoryValue(key) {
        return this.getPm2EndpointValueByName(key, constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name);
    }
    async getPm2ErroredHistoryTimeseries(key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(key, constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name, startTime, endTime);
    }
    async getVmCpuUsageValue() {
        return this.getVmEndpointValueByName(constants_1.METRICS_ENDPOINTS.CPU_USAGE.name);
    }
    async getVmCpuUsageTimeseries(startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(constants_1.METRICS_ENDPOINTS.CPU_USAGE.name, startTime, endTime);
    }
    async getVmRamUsageValue() {
        return this.getVmEndpointValueByName(constants_1.METRICS_ENDPOINTS.RAM_USAGE.name);
    }
    async getVmRamUsageTimeseries(startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(constants_1.METRICS_ENDPOINTS.RAM_USAGE.name, startTime, endTime);
    }
    async getVmDiskUsageValue() {
        return this.getVmEndpointValueByName(constants_1.METRICS_ENDPOINTS.DISK_USAGE.name);
    }
    async getVmDiskUsageTimeseries(startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(constants_1.METRICS_ENDPOINTS.DISK_USAGE.name, startTime, endTime);
    }
    async getPm2EndpointValueByName(key, endpointName) {
        try {
            const processNode = this.getPm2NodeFromKey(key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for process '${key}'.` };
            }
            const element = await endpointNode.getElement(true);
            return {
                id: endpointNode.getId().get(),
                name: endpointNode.getName().get(),
                currentValue: element?.currentValue?.get() ?? null,
                unit: element?.unit?.get() ?? null,
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve endpoint value" };
        }
    }
    async getPm2EndpointTimeSeriesByName(key, endpointName, startTime, endTime) {
        try {
            if (typeof startTime !== "number" || typeof endTime !== "number") {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "startTime and endTime query parameters are required" };
            }
            if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "Invalid time range: startTime must be lower than endTime" };
            }
            const processNode = this.getPm2NodeFromKey(key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${key}' not found.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for process '${key}'.` };
            }
            const timeseries = await this.endpointUtils.getEndpointsTimeSeries(endpointNode, startTime, endTime);
            return {
                id: endpointNode.getId().get(),
                name: endpointNode.getName().get(),
                values: timeseries.map((entry) => ({
                    date: entry.date,
                    value: entry.value,
                })),
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve endpoint history" };
        }
    }
    async getVmEndpointValueByName(endpointName) {
        try {
            const vmContext = this.spinalGraphService.getVmContext();
            if (!vmContext) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: "VM context not initialized." };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(vmContext, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for VM context.` };
            }
            const element = await endpointNode.getElement(true);
            return {
                id: endpointNode.getId().get(),
                name: endpointNode.getName().get(),
                currentValue: element?.currentValue?.get() ?? null,
                unit: element?.unit?.get() ?? null,
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve VM endpoint value" };
        }
    }
    async getVmEndpointTimeSeriesByName(endpointName, startTime, endTime) {
        try {
            if (typeof startTime !== "number" || typeof endTime !== "number") {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "startTime and endTime query parameters are required" };
            }
            if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "Invalid time range: startTime must be lower than endTime" };
            }
            const vmContext = this.spinalGraphService.getVmContext();
            if (!vmContext) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: "VM context not initialized." };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(vmContext, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for VM context.` };
            }
            const timeseries = await this.endpointUtils.getEndpointsTimeSeries(endpointNode, startTime, endTime);
            return {
                id: endpointNode.getId().get(),
                name: endpointNode.getName().get(),
                values: timeseries.map((entry) => ({
                    date: entry.date,
                    value: entry.value,
                })),
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to retrieve VM endpoint history" };
        }
    }
    getPm2NodeFromKey(key) {
        return this.spinalGraphService.getPm2NodeByKey(key);
    }
};
exports.EndpointController = EndpointController;
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/ram/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RamHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/ram/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RamHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/cpu/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2CpuHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/cpu/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2CpuHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_size/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapSizeHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_size/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapSizeHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_usage/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsageHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_usage/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsageHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_used_size/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsedSizeHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/heap_used_size/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsedSizeHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/reboot/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RebootHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/reboot/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RebootHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/errored/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2ErroredHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("pm2/{key}/errored/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2ErroredHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("vm/cpu_usage/value"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmCpuUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("vm/cpu_usage/timeseries"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmCpuUsageTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("vm/ram_usage/value"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmRamUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("vm/ram_usage/timeseries"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmRamUsageTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("vm/disk_usage/value"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmDiskUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("vm/disk_usage/timeseries"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmDiskUsageTimeseries", null);
exports.EndpointController = EndpointController = __decorate([
    (0, tsoa_1.Route)("monitoring/endpoints"),
    (0, tsoa_1.Tags)("Monitoring")
], EndpointController);
//# sourceMappingURL=EndpointController.js.map
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
const EndpointService_1 = __importDefault(require("..//services/EndpointService"));
const GraphService_1 = require("../services/GraphService");
const HTTP_RESPONSE_1 = require("../../utils/HTTP_RESPONSE");
const constants_1 = require("../../utils/constants");
let EndpointController = class EndpointController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this.endpointUtils = EndpointService_1.default.getInstance();
        this.VMGraphServiceInstance = GraphService_1.GraphService.getInstance();
    }
    async getPm2RamHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.RAM_HISTORY.name);
    }
    async getPm2RamHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.RAM_HISTORY.name, startTime, endTime);
    }
    async getPm2CpuHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.CPU_HISTORY.name);
    }
    async getPm2CpuHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.CPU_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapSizeHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
    }
    async getPm2HeapSizeHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapUsageHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
    }
    async getPm2HeapUsageHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name, startTime, endTime);
    }
    async getPm2HeapUsedSizeHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);
    }
    async getPm2HeapUsedSizeHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name, startTime, endTime);
    }
    async getPm2RebootHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name);
    }
    async getPm2RebootHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name, startTime, endTime);
    }
    async getPm2ErroredHistoryValue(vmKey, pm2Key) {
        return this.getPm2EndpointValueByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name);
    }
    async getPm2ErroredHistoryTimeseries(vmKey, pm2Key, startTime, endTime) {
        return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name, startTime, endTime);
    }
    async updatePm2EndpointMaxDay(vmKey, pm2Key, endpoint, body) {
        try {
            const parsedMaxDay = Number(body?.maxDay);
            if (!Number.isFinite(parsedMaxDay) || parsedMaxDay <= 0) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "maxDay is required and must be a number greater than 0" };
            }
            const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
            }
            const endpointName = this.resolvePm2EndpointName(endpoint);
            if (!endpointName) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: `Unknown PM2 endpoint '${endpoint}'.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for process '${pm2Key}'.` };
            }
            await this.endpointUtils.updateEndpointMaxDay(endpointNode, parsedMaxDay);
            return {
                message: `Updated timeSeries maxDay for '${endpointName}' on process '${pm2Key}'.`,
                success: true,
                key: pm2Key,
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to update PM2 endpoint maxDay" };
        }
    }
    async getVmCpuUsageValue(vmKey) {
        return this.getVmEndpointValueByName(vmKey, constants_1.METRICS_ENDPOINTS.CPU_USAGE.name);
    }
    async getVmCpuUsageTimeseries(vmKey, startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(vmKey, constants_1.METRICS_ENDPOINTS.CPU_USAGE.name, startTime, endTime);
    }
    async getVmRamUsageValue(vmKey) {
        return this.getVmEndpointValueByName(vmKey, constants_1.METRICS_ENDPOINTS.RAM_USAGE.name);
    }
    async getVmRamUsageTimeseries(vmKey, startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(vmKey, constants_1.METRICS_ENDPOINTS.RAM_USAGE.name, startTime, endTime);
    }
    async getVmDiskUsageValue(vmKey) {
        return this.getVmEndpointValueByName(vmKey, constants_1.METRICS_ENDPOINTS.DISK_USAGE.name);
    }
    async getVmDiskUsageTimeseries(vmKey, startTime, endTime) {
        return this.getVmEndpointTimeSeriesByName(vmKey, constants_1.METRICS_ENDPOINTS.DISK_USAGE.name, startTime, endTime);
    }
    async updateVmEndpointMaxDay(vmKey, endpoint, body) {
        try {
            const parsedMaxDay = Number(body?.maxDay);
            if (!Number.isFinite(parsedMaxDay) || parsedMaxDay <= 0) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "maxDay is required and must be a number greater than 0" };
            }
            const processNode = await this.getVmContextFromKey(vmKey);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `VM '${vmKey}' not found.` };
            }
            const endpointName = this.resolveVmEndpointName(endpoint);
            if (!endpointName) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: `Unknown endpoint '${endpoint}'.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found'.` };
            }
            await this.endpointUtils.updateEndpointMaxDay(endpointNode, parsedMaxDay);
            return {
                message: `Updated timeSeries maxDay for '${endpointName}'.`,
                success: true,
            };
        }
        catch (error) {
            this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
            return { error: error.message || "Unable to update PM2 endpoint maxDay" };
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    ////////////////////////////////////////////////////////////////////////////////////////
    async getPm2EndpointValueByName(vmKey, pm2Key, endpointName) {
        try {
            const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for process '${pm2Key}'.` };
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
    async getPm2EndpointTimeSeriesByName(vmKey, pm2Key, endpointName, startTime, endTime) {
        try {
            startTime = startTime ?? 0;
            endTime = endTime ?? Date.now();
            if (typeof startTime !== "number" || typeof endTime !== "number") {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "startTime and endTime query parameters are required" };
            }
            if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "Invalid time range: startTime must be lower than endTime" };
            }
            const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);
            if (!processNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
            }
            const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
            if (!endpointNode) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `Endpoint '${endpointName}' not found for process '${pm2Key}'.` };
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
    async getVmEndpointValueByName(vmKey, endpointName) {
        try {
            const vmContext = await this.getVmContextFromKey(vmKey);
            if (!vmContext) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `VM '${vmKey}' not found.` };
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
    async getVmEndpointTimeSeriesByName(vmKey, endpointName, startTime, endTime) {
        try {
            startTime = startTime ?? 0;
            endTime = endTime ?? Date.now();
            if (typeof startTime !== "number" || typeof endTime !== "number") {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "startTime and endTime query parameters are required" };
            }
            if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code);
                return { error: "Invalid time range: startTime must be lower than endTime" };
            }
            const vmContext = await this.getVmContextFromKey(vmKey);
            if (!vmContext) {
                this.setStatus(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code);
                return { error: `VM '${vmKey}' not found.` };
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
    async getPm2NodeFromKey(vmKey, pm2Key) {
        const vmContext = await this.getVmContextFromKey(vmKey);
        if (!vmContext)
            return undefined;
        return this.VMGraphServiceInstance.getPm2ProcessNodeByKey(vmContext, pm2Key);
    }
    async getVmContextFromKey(vmKey) {
        return this.VMGraphServiceInstance.getVirtualMachine(vmKey);
    }
    resolvePm2EndpointName(endpoint) {
        const endpointMap = {
            ram: constants_1.PM2_ENDPOINTS.RAM_HISTORY.name,
            cpu: constants_1.PM2_ENDPOINTS.CPU_HISTORY.name,
            heap_size: constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name,
            heap_usage: constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name,
            heap_used_size: constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name,
            reboot: constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name,
            errored: constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name,
            ram_history: constants_1.PM2_ENDPOINTS.RAM_HISTORY.name,
            cpu_history: constants_1.PM2_ENDPOINTS.CPU_HISTORY.name,
            heap_size_history: constants_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name,
            heap_usage_history: constants_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name,
            heap_used_size_history: constants_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name,
            reboot_history: constants_1.PM2_ENDPOINTS.REBOOT_HISTORY.name,
            errored_history: constants_1.PM2_ENDPOINTS.ERRORED_HISTORY.name,
        };
        return endpointMap[endpoint] || null;
    }
    resolveVmEndpointName(endpoint) {
        const endpointMap = {
            ram: constants_1.METRICS_ENDPOINTS.RAM_USAGE.name,
            cpu: constants_1.METRICS_ENDPOINTS.CPU_USAGE.name,
            disk: constants_1.METRICS_ENDPOINTS.DISK_USAGE.name,
            ram_usage: constants_1.METRICS_ENDPOINTS.RAM_USAGE.name,
            cpu_usage: constants_1.METRICS_ENDPOINTS.CPU_USAGE.name,
            disk_usage: constants_1.METRICS_ENDPOINTS.DISK_USAGE.name,
        };
        return endpointMap[endpoint] || null;
    }
};
exports.EndpointController = EndpointController;
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/ram/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RamHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/ram/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RamHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/cpu/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2CpuHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/cpu/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2CpuHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_size/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapSizeHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_size/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapSizeHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_usage/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsageHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_usage/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsageHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_used_size/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsedSizeHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/heap_used_size/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2HeapUsedSizeHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/reboot/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RebootHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/reboot/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2RebootHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/errored/value"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2ErroredHistoryValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/pm2/{pm2Key}/errored/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getPm2ErroredHistoryTimeseries", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/pm2/{pm2Key}/{endpoint}/timeseries/maxDay"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Path)()),
    __param(3, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "updatePm2EndpointMaxDay", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/cpu_usage/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmCpuUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/cpu_usage/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmCpuUsageTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/ram_usage/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmRamUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/ram_usage/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmRamUsageTimeseries", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/disk_usage/value"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmDiskUsageValue", null);
__decorate([
    (0, tsoa_1.Get)("{vmKey}/vm/disk_usage/timeseries"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getVmDiskUsageTimeseries", null);
__decorate([
    (0, tsoa_1.Post)("{vmKey}/vm/{endpoint}/timeseries/maxDay"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "updateVmEndpointMaxDay", null);
exports.EndpointController = EndpointController = __decorate([
    (0, tsoa_1.Route)("monitoring/endpoints"),
    (0, tsoa_1.Tags)("Monitoring")
], EndpointController);
//# sourceMappingURL=EndpointController.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointService = void 0;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const utils_1 = require("../../utils");
const networkService_1 = require("../../utils/networkService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
class EndpointService {
    constructor() { }
    static getInstance() {
        if (!this.instance)
            this.instance = new EndpointService();
        return this.instance;
    }
    async getEndpointByName(parentNode, endpointName) {
        const endpoints = await parentNode.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const endpoint = endpoints.find((endpoint) => endpoint.getName().get() === endpointName);
        return endpoint || null;
    }
    async getEndpointsTimeSeries(endpointNode, startTime, endTime) {
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(endpointNode);
        const timeInterval = { start: startTime, end: endTime };
        return networkService_1.spinalServiceTimeseries.getData(endpointNode.getId().get(), timeInterval);
    }
    async updateEndpointMaxDay(endpointNode, maxDay) {
        return (0, networkService_1.updateEndpointMaxDay)(endpointNode, maxDay);
    }
    ////////////////////////////////////////////////
    //  METRICS ENDPOINTS
    ////////////////////////////////////////////////
    async updateOrCreateMetricsEndpoints(parentNode, metricsData, isInit = false) {
        const ramUsage = this._toNumber(metricsData.ramUsagePercent);
        const cpuUsage = this._toNumber(metricsData.cpuUsage);
        const diskUsage = this._toNumber(metricsData.diskUsagePercent);
        const endpoints = await parentNode.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const promises = [];
        promises.push((0, networkService_1.updateOrCreateEndpoint)(parentNode, utils_1.METRICS_ENDPOINTS.RAM_USAGE, { value: ramUsage, min: 0, max: 100 }, endpoints));
        promises.push((0, networkService_1.updateOrCreateEndpoint)(parentNode, utils_1.METRICS_ENDPOINTS.CPU_USAGE, { value: cpuUsage, min: 0, max: 100 }, endpoints));
        promises.push((0, networkService_1.updateOrCreateEndpoint)(parentNode, utils_1.METRICS_ENDPOINTS.DISK_USAGE, { value: diskUsage, min: 0, max: 100 }, endpoints));
        const results = await Promise.all(promises);
        await this._updateMaxDayIfInit(results, isInit);
        return results;
    }
    //////////////////////////////////////////////////
    //  PM2 ENDPOINTS
    //////////////////////////////////////////////////
    async updateOrCreatePm2ProcessEndpoints(pm2Node, isInit = false) {
        const memory = pm2Node.info?.monit?.memory?.get() || 0;
        const cpu = pm2Node.info?.monit?.cpu?.get() || 0;
        const heapInfo = pm2Node.info?.heapMemory?.get() || {};
        const heapData = {
            heapSize: heapInfo?.heapSize?.value || 0,
            heapUsage: heapInfo?.heapUsage?.value || 0,
            heapUsedSize: heapInfo?.heapUsedSize?.value || 0,
        };
        const endpoints = await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const promises = [];
        promises.push(this._updateOrCreateRamEndpoint(pm2Node, memory, endpoints, isInit));
        promises.push(this._updateOrCreateCPUEndpoint(pm2Node, cpu, endpoints, isInit));
        promises.push(this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData, endpoints, isInit));
        promises.push(this._updateRebootEndpoint(pm2Node, pm2Node.info?.reboot?.get() || 0, endpoints, isInit));
        promises.push(this._updateErroredEndpoint(pm2Node, pm2Node.info?.errored?.get() || 0, endpoints, isInit));
        await Promise.all(promises);
    }
    async _updateOrCreateRamEndpoint(pm2Node, memoryValue, existingEndpoints, isInit = false) {
        const endpoint = await (0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.RAM_HISTORY, { value: memoryValue }, existingEndpoints);
        await this._updateMaxDayIfInit(endpoint, isInit);
        return endpoint;
    }
    async _updateOrCreateCPUEndpoint(pm2Node, cpuValue, existingEndpoints, isInit = false) {
        const endpoint = await (0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.CPU_HISTORY, { value: cpuValue }, existingEndpoints);
        await this._updateMaxDayIfInit(endpoint, isInit);
        return endpoint;
    }
    async _updateOrCreateHeapMemoryEndpoints(pm2Node, heapInfo, existingEndpoints, isInit = false) {
        const endpoints = existingEndpoints || (await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]));
        const promises = [];
        // Update or create heapSize memory endpoints
        promises.push((0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY, { value: heapInfo.heapSize }, endpoints));
        promises.push((0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY, { value: heapInfo.heapUsage }, endpoints));
        promises.push((0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY, { value: heapInfo.heapUsedSize }, endpoints));
        const results = await Promise.all(promises);
        await this._updateMaxDayIfInit(results, isInit);
        return results;
    }
    async _updateRebootEndpoint(pm2Node, value, existingEndpoints, isInit = false) {
        const endpoint = await (0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.REBOOT_HISTORY, { value }, existingEndpoints);
        await this._updateMaxDayIfInit(endpoint, isInit);
        return endpoint;
    }
    async _updateErroredEndpoint(pm2Node, erroredCount, existingEndpoints, isInit = false) {
        const endpoint = await (0, networkService_1.updateOrCreateEndpoint)(pm2Node, utils_1.PM2_ENDPOINTS.ERRORED_HISTORY, { value: erroredCount }, existingEndpoints);
        await this._updateMaxDayIfInit(endpoint, isInit);
        return endpoint;
    }
    _toNumber(value) {
        if (typeof value === "number")
            return Number.isFinite(value) ? value : 0;
        if (typeof value !== "string")
            return 0;
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    _getTimeseriesMaxDay() {
        return process.env.TIMESERIES_MAX_DAY || "2";
    }
    async _updateMaxDayIfInit(endpoints, isInit) {
        if (!isInit)
            return;
        const maxDay = this._getTimeseriesMaxDay();
        if (Array.isArray(endpoints)) {
            await Promise.all(endpoints.map((endpoint) => (0, networkService_1.updateEndpointMaxDay)(endpoint, maxDay)));
            return;
        }
        await (0, networkService_1.updateEndpointMaxDay)(endpoints, maxDay);
    }
}
exports.EndpointService = EndpointService;
exports.default = EndpointService;
//# sourceMappingURL=EndpointService.js.map
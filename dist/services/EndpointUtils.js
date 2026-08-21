"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointUtils = void 0;
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const utils_1 = require("../utils");
const networkService_1 = require("../utils/networkService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
class EndpointUtils {
    constructor() { }
    static getInstance() {
        if (!this.instance)
            this.instance = new EndpointUtils();
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
    async createOrUpdateEndpoints(parentNode, endpointsData) {
        const endpoints = await parentNode.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const endpointsToObj = endpoints.reduce((acc, endpoint) => {
            const endpointName = endpoint.getName().get();
            acc[endpointName] = endpoint;
            return acc;
        }, {});
        const promises = [];
        for (const endpoint of endpointsData) {
            const name = endpoint.name;
            if (!endpointsToObj[name]) {
                promises.push((0, networkService_1.createNewBmsEndpoint)(parentNode, endpoint));
            }
        }
        return Promise.all(promises);
    }
    ////////////////////////////////////////////////
    //  METRICS ENDPOINTS
    ////////////////////////////////////////////////
    async updateOrCreateMetricsEndpoints(parentNode, metricsData) {
        const ramUsage = parseFloat(metricsData.ramUsagePercent || "0");
        const cpuUsage = parseFloat(metricsData.cpuUsage);
        const diskUsage = parseFloat(metricsData.diskUsagePercent || "0");
        const endpoints = await parentNode.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const ramEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.METRICS_ENDPOINTS.RAM_USAGE.name);
        const cpuEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.METRICS_ENDPOINTS.CPU_USAGE.name);
        const diskEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.METRICS_ENDPOINTS.DISK_USAGE.name);
        const promises = [];
        // Update or create RAM endpoint
        if (ramEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(ramEndpoint, ramUsage));
        else {
            const endpointData = this._formatEndpointData(utils_1.METRICS_ENDPOINTS.RAM_USAGE, { value: ramUsage, min: 0, max: 100 });
            promises.push((0, networkService_1.createNewBmsEndpoint)(parentNode, endpointData));
        }
        // Update or create CPU endpoint
        if (cpuEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(cpuEndpoint, cpuUsage));
        else {
            const endpointData = this._formatEndpointData(utils_1.METRICS_ENDPOINTS.CPU_USAGE, { value: cpuUsage, min: 0, max: 100 });
            promises.push((0, networkService_1.createNewBmsEndpoint)(parentNode, endpointData));
        }
        if (diskEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(diskEndpoint, diskUsage));
        else {
            const endpointData = this._formatEndpointData(utils_1.METRICS_ENDPOINTS.DISK_USAGE, { value: diskUsage, min: 0, max: 100 });
            promises.push((0, networkService_1.createNewBmsEndpoint)(parentNode, endpointData));
        }
        return Promise.all(promises);
    }
    //////////////////////////////////////////////////
    //  PM2 ENDPOINTS
    //////////////////////////////////////////////////
    async updateOrCreatePm2ProcessEndpoints(pm2Node) {
        const memory = pm2Node.info?.monit?.memory?.get() || 0;
        const cpu = pm2Node.info?.monit?.cpu?.get() || 0;
        const heapData = pm2Node.info?.heapMemory?.get() || { heapSize: 0, heapUsage: 0, heapUsedSize: 0 };
        const endpoints = await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        await this._updateOrCreateRamEndpoint(pm2Node, memory, endpoints);
        await this._updateOrCreateCPUEndpoint(pm2Node, cpu, endpoints);
        await this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData, endpoints);
        // promises.push(this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData));
        // promises.push(this._updateOrCreateCPUEndpoint(pm2Node, cpu));
        // promises.push(this._updateHeapMemoryEndpoints(pm2Node, heapData));
        // return Promise.all(promises);
    }
    async _updateOrCreateRamEndpoint(pm2Node, memoryValue, existingEndpoints) {
        const endpoints = existingEndpoints || (await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]));
        const ramEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.RAM_HISTORY.name);
        if (ramEndpoint)
            return (0, networkService_1.updateEndpoint)(ramEndpoint, memoryValue);
        const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.RAM_HISTORY, { value: memoryValue });
        return (0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData);
    }
    async _updateOrCreateCPUEndpoint(pm2Node, cpuValue, existingEndpoints) {
        const endpoints = existingEndpoints || (await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]));
        const cpuEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.CPU_HISTORY.name);
        if (cpuEndpoint)
            return (0, networkService_1.updateEndpoint)(cpuEndpoint, cpuValue);
        const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.CPU_HISTORY, { value: cpuValue });
        return (0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData);
    }
    async _updateOrCreateHeapMemoryEndpoints(pm2Node, heapInfo, existingEndpoints) {
        const endpoints = existingEndpoints || (await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]));
        const heapSizeEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
        const heapUsageEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
        const heapUsedSizeEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);
        const promises = [];
        // Update or create heapSize memory endpoints
        if (heapSizeEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(heapSizeEndpoint, heapInfo.heapSize));
        else {
            const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.HEAP_SIZE_HISTORY, { value: heapInfo.heapSize });
            promises.push((0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData));
        }
        // Update or create heapUsage memory endpoints
        if (heapUsageEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(heapUsageEndpoint, heapInfo.heapUsage));
        else {
            const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.HEAP_USAGE_HISTORY, { value: heapInfo.heapUsage });
            promises.push((0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData));
        }
        // Update or create heapUsedSize memory endpoints
        if (heapUsedSizeEndpoint)
            promises.push((0, networkService_1.updateEndpoint)(heapUsedSizeEndpoint, heapInfo.heapUsedSize));
        else {
            const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY, { value: heapInfo.heapUsedSize });
            promises.push((0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData));
        }
        return Promise.all(promises);
    }
    async _updateRebootEndpoint(pm2Node, value) {
        const endpoints = await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const rebootEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.REBOOT_HISTORY.name);
        if (rebootEndpoint)
            return (0, networkService_1.updateEndpoint)(rebootEndpoint, value);
        const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.REBOOT_HISTORY, { value });
        return (0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData);
    }
    async _updateErroredEndpoint(pm2Node, erroredCount) {
        const endpoints = await pm2Node.getChildren([spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName]);
        const erroredEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === utils_1.PM2_ENDPOINTS.ERRORED_HISTORY.name);
        if (erroredEndpoint)
            return (0, networkService_1.updateEndpoint)(erroredEndpoint, erroredCount);
        const endpointData = this._formatEndpointData(utils_1.PM2_ENDPOINTS.ERRORED_HISTORY, { value: erroredCount });
        return (0, networkService_1.createNewBmsEndpoint)(pm2Node, endpointData);
    }
    _formatEndpointData(endpoint, data) {
        return {
            ...endpoint,
            currentValue: data.value,
            minValue: data.min,
            maxValue: data.max,
        };
    }
}
exports.EndpointUtils = EndpointUtils;
exports.default = EndpointUtils;
//# sourceMappingURL=EndpointUtils.js.map
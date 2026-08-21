import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { InputDataEndpoint, SpinalBmsEndpoint, SpinalServiceTimeseries } from "spinal-model-bmsnetwork";
import { METRICS_ENDPOINTS, PM2_ENDPOINTS } from "../utils";
import { createNewBmsEndpoint, updateEndpoint, spinalServiceTimeseries } from "../utils/networkService";
import { ISystemMetrics } from "../interfaces";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

export class EndpointUtils {
	private static instance: EndpointUtils;

	private constructor() {}

	public static getInstance(): EndpointUtils {
		if (!this.instance) this.instance = new EndpointUtils();
		return this.instance;
	}

	public async getEndpointByName(parentNode: SpinalNode, endpointName: string): Promise<SpinalNode | null> {
		const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);
		const endpoint = endpoints.find((endpoint) => endpoint.getName().get() === endpointName);
		return endpoint || null;
	}

	public async getEndpointsTimeSeries(endpointNode: SpinalNode, startTime: number, endTime: number) {
		SpinalGraphService._addNode(endpointNode);
		const timeInterval = { start: startTime, end: endTime };

		return spinalServiceTimeseries.getData(endpointNode.getId().get(), timeInterval);
	}

	public async createOrUpdateEndpoints(parentNode: SpinalNode, endpointsData: InputDataEndpoint[]) {
		const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);

		const endpointsToObj = endpoints.reduce((acc, endpoint) => {
			const endpointName = endpoint.getName().get();
			acc[endpointName] = endpoint;
			return acc;
		}, {} as { [key: string]: SpinalNode });

		const promises = [];

		for (const endpoint of endpointsData) {
			const name = endpoint.name;
			if (!endpointsToObj[name]) {
				promises.push(createNewBmsEndpoint(parentNode, endpoint));
			}
		}

		return Promise.all(promises);
	}

	////////////////////////////////////////////////
	//  METRICS ENDPOINTS
	////////////////////////////////////////////////

	public async updateOrCreateMetricsEndpoints(parentNode: SpinalNode, metricsData: ISystemMetrics) {
		const ramUsage = parseFloat(metricsData.ramUsagePercent || "0");
		const cpuUsage = parseFloat(metricsData.cpuUsage);
		const diskUsage = parseFloat(metricsData.diskUsagePercent || "0");

		const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);

		const ramEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === METRICS_ENDPOINTS.RAM_USAGE.name);
		const cpuEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === METRICS_ENDPOINTS.CPU_USAGE.name);
		const diskEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === METRICS_ENDPOINTS.DISK_USAGE.name);

		const promises = [];

		// Update or create RAM endpoint
		if (ramEndpoint) promises.push(updateEndpoint(ramEndpoint, ramUsage));
		else {
			const endpointData = this._formatEndpointData(METRICS_ENDPOINTS.RAM_USAGE, { value: ramUsage, min: 0, max: 100 });
			promises.push(createNewBmsEndpoint(parentNode, endpointData));
		}

		// Update or create CPU endpoint
		if (cpuEndpoint) promises.push(updateEndpoint(cpuEndpoint, cpuUsage));
		else {
			const endpointData = this._formatEndpointData(METRICS_ENDPOINTS.CPU_USAGE, { value: cpuUsage, min: 0, max: 100 });
			promises.push(createNewBmsEndpoint(parentNode, endpointData));
		}

		if (diskEndpoint) promises.push(updateEndpoint(diskEndpoint, diskUsage));
		else {
			const endpointData = this._formatEndpointData(METRICS_ENDPOINTS.DISK_USAGE, { value: diskUsage, min: 0, max: 100 });
			promises.push(createNewBmsEndpoint(parentNode, endpointData));
		}

		return Promise.all(promises);
	}

	//////////////////////////////////////////////////
	//  PM2 ENDPOINTS
	//////////////////////////////////////////////////

	public async updateOrCreatePm2ProcessEndpoints(pm2Node: SpinalNode) {
		const memory = pm2Node.info?.monit?.memory?.get() || 0;
		const cpu = pm2Node.info?.monit?.cpu?.get() || 0;

		const heapData = pm2Node.info?.heapMemory?.get() || { heapSize: 0, heapUsage: 0, heapUsedSize: 0 };

		const endpoints = await pm2Node.getChildren([SpinalBmsEndpoint.relationName]);

		await this._updateOrCreateRamEndpoint(pm2Node, memory, endpoints);
		await this._updateOrCreateCPUEndpoint(pm2Node, cpu, endpoints);
		await this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData, endpoints);
		// promises.push(this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData));
		// promises.push(this._updateOrCreateCPUEndpoint(pm2Node, cpu));
		// promises.push(this._updateHeapMemoryEndpoints(pm2Node, heapData));

		// return Promise.all(promises);
	}

	private async _updateOrCreateRamEndpoint(pm2Node: SpinalNode, memoryValue: number, existingEndpoints?: SpinalNode[]) {
		const endpoints = existingEndpoints || (await pm2Node.getChildren([SpinalBmsEndpoint.relationName]));
		const ramEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.RAM_HISTORY.name);
		if (ramEndpoint) return updateEndpoint(ramEndpoint, memoryValue);

		const endpointData = this._formatEndpointData(PM2_ENDPOINTS.RAM_HISTORY, { value: memoryValue });
		return createNewBmsEndpoint(pm2Node, endpointData);
	}

	private async _updateOrCreateCPUEndpoint(pm2Node: SpinalNode, cpuValue: number, existingEndpoints?: SpinalNode[]) {
		const endpoints = existingEndpoints || (await pm2Node.getChildren([SpinalBmsEndpoint.relationName]));
		const cpuEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.CPU_HISTORY.name);
		if (cpuEndpoint) return updateEndpoint(cpuEndpoint, cpuValue);

		const endpointData = this._formatEndpointData(PM2_ENDPOINTS.CPU_HISTORY, { value: cpuValue });
		return createNewBmsEndpoint(pm2Node, endpointData);
	}

	private async _updateOrCreateHeapMemoryEndpoints(pm2Node: SpinalNode, heapInfo: { heapSize: number; heapUsage: number; heapUsedSize: number }, existingEndpoints?: SpinalNode[]) {
		const endpoints = existingEndpoints || (await pm2Node.getChildren([SpinalBmsEndpoint.relationName]));
		const heapSizeEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
		const heapUsageEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
		const heapUsedSizeEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);

		const promises = [];

		// Update or create heapSize memory endpoints
		if (heapSizeEndpoint) promises.push(updateEndpoint(heapSizeEndpoint, heapInfo.heapSize));
		else {
			const endpointData = this._formatEndpointData(PM2_ENDPOINTS.HEAP_SIZE_HISTORY, { value: heapInfo.heapSize });
			promises.push(createNewBmsEndpoint(pm2Node, endpointData));
		}

		// Update or create heapUsage memory endpoints
		if (heapUsageEndpoint) promises.push(updateEndpoint(heapUsageEndpoint, heapInfo.heapUsage));
		else {
			const endpointData = this._formatEndpointData(PM2_ENDPOINTS.HEAP_USAGE_HISTORY, { value: heapInfo.heapUsage });
			promises.push(createNewBmsEndpoint(pm2Node, endpointData));
		}

		// Update or create heapUsedSize memory endpoints
		if (heapUsedSizeEndpoint) promises.push(updateEndpoint(heapUsedSizeEndpoint, heapInfo.heapUsedSize));
		else {
			const endpointData = this._formatEndpointData(PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY, { value: heapInfo.heapUsedSize });
			promises.push(createNewBmsEndpoint(pm2Node, endpointData));
		}

		return Promise.all(promises);
	}

	public async _updateRebootEndpoint(pm2Node: SpinalNode, value: number) {
		const endpoints = await pm2Node.getChildren([SpinalBmsEndpoint.relationName]);
		const rebootEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.REBOOT_HISTORY.name);
		if (rebootEndpoint) return updateEndpoint(rebootEndpoint, value);

		const endpointData = this._formatEndpointData(PM2_ENDPOINTS.REBOOT_HISTORY, { value });
		return createNewBmsEndpoint(pm2Node, endpointData);
	}

	public async _updateErroredEndpoint(pm2Node: SpinalNode, erroredCount: number) {
		const endpoints = await pm2Node.getChildren([SpinalBmsEndpoint.relationName]);
		const erroredEndpoint = endpoints.find((endpoint) => endpoint.getName().get() === PM2_ENDPOINTS.ERRORED_HISTORY.name);
		if (erroredEndpoint) return updateEndpoint(erroredEndpoint, erroredCount);

		const endpointData = this._formatEndpointData(PM2_ENDPOINTS.ERRORED_HISTORY, { value: erroredCount });
		return createNewBmsEndpoint(pm2Node, endpointData);
	}

	private _formatEndpointData(endpoint: InputDataEndpoint, data: { value: number | string | boolean; min?: number; max?: number }): InputDataEndpoint {
		return {
			...endpoint,
			currentValue: data.value,
			minValue: data.min,
			maxValue: data.max,
		} as InputDataEndpoint;
	}
}

export default EndpointUtils;

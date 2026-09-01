import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { InputDataEndpoint, SpinalBmsEndpoint, SpinalServiceTimeseries } from "spinal-model-bmsnetwork";
import { METRICS_ENDPOINTS, PM2_ENDPOINTS } from "../utils";
import { createNewBmsEndpoint, updateEndpoint, spinalServiceTimeseries, updateOrCreateEndpoint, updateEndpointMaxDay } from "../utils/networkService";
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

	public async updateEndpointMaxDay(endpointNode: SpinalNode, maxDay: string | number) {
		return updateEndpointMaxDay(endpointNode, maxDay);
	}

	// public async createOrUpdateEndpoints(parentNode: SpinalNode, endpointsData: InputDataEndpoint[]) {
	// 	const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);

	// 	const endpointsToObj = endpoints.reduce((acc, endpoint) => {
	// 		const endpointName = endpoint.getName().get();
	// 		acc[endpointName] = endpoint;
	// 		return acc;
	// 	}, {} as { [key: string]: SpinalNode });

	// 	const promises = [];

	// 	for (const endpoint of endpointsData) {
	// 		const name = endpoint.name;
	// 		if (!endpointsToObj[name]) {
	// 			promises.push(createNewBmsEndpoint(parentNode, endpoint));
	// 		}
	// 	}

	// 	return Promise.all(promises);
	// }

	////////////////////////////////////////////////
	//  METRICS ENDPOINTS
	////////////////////////////////////////////////

	public async updateOrCreateMetricsEndpoints(parentNode: SpinalNode, metricsData: ISystemMetrics, isInit: boolean = false) {
		const ramUsage = parseFloat(metricsData.ramUsagePercent || "0");
		const cpuUsage = parseFloat(metricsData.cpuUsage);
		const diskUsage = parseFloat(metricsData.diskUsagePercent || "0");

		const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);

		const promises = [];

		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.RAM_USAGE, { value: ramUsage, min: 0, max: 100 }, endpoints));
		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.CPU_USAGE, { value: cpuUsage, min: 0, max: 100 }, endpoints));
		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.DISK_USAGE, { value: diskUsage, min: 0, max: 100 }, endpoints));

		return Promise.all(promises).then(async (results: SpinalNode[]) => {
			if (isInit) {
				const maxDay = process.env.TIMESERIES_MAX_DAY || "2";
				const p2 = results.map((endpoint) => updateEndpointMaxDay(endpoint, maxDay));
				await Promise.all(p2);
			}

			return results;
		});
	}

	//////////////////////////////////////////////////
	//  PM2 ENDPOINTS
	//////////////////////////////////////////////////

	public async updateOrCreatePm2ProcessEndpoints(pm2Node: SpinalNode, isInit: boolean = false) {
		const memory = pm2Node.info?.monit?.memory?.get() || 0;
		const cpu = pm2Node.info?.monit?.cpu?.get() || 0;
		const heapInfo = pm2Node.info?.heapMemory?.get() || {};

		const heapData = {
			heapSize: heapInfo?.heapSize?.value || 0,
			heapUsage: heapInfo?.heapUsage?.value || 0,
			heapUsedSize: heapInfo?.heapUsedSize?.value || 0,
		};

		const endpoints = await pm2Node.getChildren([SpinalBmsEndpoint.relationName]);
		const promises = [];

		promises.push(this._updateOrCreateRamEndpoint(pm2Node, memory, endpoints, isInit));
		promises.push(this._updateOrCreateCPUEndpoint(pm2Node, cpu, endpoints, isInit));
		promises.push(this._updateOrCreateHeapMemoryEndpoints(pm2Node, heapData, endpoints, isInit));
		promises.push(this._updateRebootEndpoint(pm2Node, pm2Node.info?.reboot?.get() || 0, endpoints, isInit));
		promises.push(this._updateErroredEndpoint(pm2Node, pm2Node.info?.errored?.get() || 0, endpoints, isInit));

		await Promise.all(promises);
	}

	private async _updateOrCreateRamEndpoint(pm2Node: SpinalNode, memoryValue: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.RAM_HISTORY, { value: memoryValue }, existingEndpoints);

		if (isInit) await updateEndpointMaxDay(endpoint, process.env.TIMESERIES_MAX_DAY || "2");

		return endpoint;
	}

	private async _updateOrCreateCPUEndpoint(pm2Node: SpinalNode, cpuValue: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.CPU_HISTORY, { value: cpuValue }, existingEndpoints);
		if (isInit) await updateEndpointMaxDay(endpoint, process.env.TIMESERIES_MAX_DAY || "2");
		return endpoint;
	}

	private async _updateOrCreateHeapMemoryEndpoints(pm2Node: SpinalNode, heapInfo: { heapSize: number; heapUsage: number; heapUsedSize: number }, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoints = existingEndpoints || (await pm2Node.getChildren([SpinalBmsEndpoint.relationName]));

		const promises = [];

		// Update or create heapSize memory endpoints
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_SIZE_HISTORY, { value: heapInfo.heapSize }, endpoints));
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_USAGE_HISTORY, { value: heapInfo.heapUsage }, endpoints));
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY, { value: heapInfo.heapUsedSize }, endpoints));

		return Promise.all(promises).then(async (results) => {
			if (isInit) {
				const p = results.map((endpoint) => updateEndpointMaxDay(endpoint, process.env.TIMESERIES_MAX_DAY || "2"));
				await Promise.all(p);
			}

			return results;
		});
	}

	public async _updateRebootEndpoint(pm2Node: SpinalNode, value: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.REBOOT_HISTORY, { value }, existingEndpoints);
		if (isInit) await updateEndpointMaxDay(endpoint, process.env.TIMESERIES_MAX_DAY || "2");
		return endpoint;
	}

	public async _updateErroredEndpoint(pm2Node: SpinalNode, erroredCount: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.ERRORED_HISTORY, { value: erroredCount }, existingEndpoints);
		if (isInit) await updateEndpointMaxDay(endpoint, process.env.TIMESERIES_MAX_DAY || "2");
		return endpoint;
	}
}

export default EndpointUtils;

import { SpinalNode } from "spinal-model-graph";
import { SpinalBmsEndpoint } from "spinal-model-bmsnetwork";
import { METRICS_ENDPOINTS, PM2_ENDPOINTS } from "../../utils";
import { spinalServiceTimeseries, updateOrCreateEndpoint, updateEndpointMaxDay } from "../../utils/networkService";
import { ISystemMetrics } from "../../interfaces";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

interface IHeapInfo {
	heapSize: number;
	heapUsage: number;
	heapUsedSize: number;
}

export class EndpointService {
	private static instance: EndpointService;

	private constructor() {}

	public static getInstance(): EndpointService {
		if (!this.instance) this.instance = new EndpointService();
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

	////////////////////////////////////////////////
	//  METRICS ENDPOINTS
	////////////////////////////////////////////////

	public async updateOrCreateMetricsEndpoints(parentNode: SpinalNode, metricsData: ISystemMetrics, isInit: boolean = false): Promise<SpinalNode[]> {
		const ramUsage = this._toNumber(metricsData.ramUsagePercent);
		const cpuUsage = this._toNumber(metricsData.cpuUsage);
		const diskUsage = this._toNumber(metricsData.diskUsagePercent);

		const endpoints = await parentNode.getChildren([SpinalBmsEndpoint.relationName]);

		const promises: Promise<SpinalNode>[] = [];

		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.RAM_USAGE, { value: ramUsage, min: 0, max: 100 }, endpoints));
		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.CPU_USAGE, { value: cpuUsage, min: 0, max: 100 }, endpoints));
		promises.push(updateOrCreateEndpoint(parentNode, METRICS_ENDPOINTS.DISK_USAGE, { value: diskUsage, min: 0, max: 100 }, endpoints));

		const results = await Promise.all(promises);
		await this._updateMaxDayIfInit(results, isInit);

		return results;
	}

	//////////////////////////////////////////////////
	//  PM2 ENDPOINTS
	//////////////////////////////////////////////////

	public async updateOrCreatePm2ProcessEndpoints(pm2Node: SpinalNode, isInit: boolean = false): Promise<void> {
		const memory = pm2Node.info?.monit?.memory?.get() || 0;
		const cpu = pm2Node.info?.monit?.cpu?.get() || 0;
		const heapInfo = pm2Node.info?.heapMemory?.get() || {};

		const heapData: IHeapInfo = {
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

	private async _updateOrCreateRamEndpoint(pm2Node: SpinalNode, memoryValue: number, existingEndpoints?: SpinalNode[], isInit: boolean = false): Promise<SpinalNode> {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.RAM_HISTORY, { value: memoryValue }, existingEndpoints);
		await this._updateMaxDayIfInit(endpoint, isInit);

		return endpoint;
	}

	private async _updateOrCreateCPUEndpoint(pm2Node: SpinalNode, cpuValue: number, existingEndpoints?: SpinalNode[], isInit: boolean = false): Promise<SpinalNode> {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.CPU_HISTORY, { value: cpuValue }, existingEndpoints);
		await this._updateMaxDayIfInit(endpoint, isInit);
		return endpoint;
	}

	private async _updateOrCreateHeapMemoryEndpoints(pm2Node: SpinalNode, heapInfo: IHeapInfo, existingEndpoints?: SpinalNode[], isInit: boolean = false): Promise<SpinalNode[]> {
		const endpoints = existingEndpoints || (await pm2Node.getChildren([SpinalBmsEndpoint.relationName]));

		const promises: Promise<SpinalNode>[] = [];

		// Update or create heapSize memory endpoints
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_SIZE_HISTORY, { value: heapInfo.heapSize }, endpoints));
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_USAGE_HISTORY, { value: heapInfo.heapUsage }, endpoints));
		promises.push(updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY, { value: heapInfo.heapUsedSize }, endpoints));

		const results = await Promise.all(promises);
		await this._updateMaxDayIfInit(results, isInit);

		return results;
	}

	public async _updateRebootEndpoint(pm2Node: SpinalNode, value: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.REBOOT_HISTORY, { value }, existingEndpoints);
		await this._updateMaxDayIfInit(endpoint, isInit);
		return endpoint;
	}

	public async _updateErroredEndpoint(pm2Node: SpinalNode, erroredCount: number, existingEndpoints?: SpinalNode[], isInit: boolean = false) {
		const endpoint = await updateOrCreateEndpoint(pm2Node, PM2_ENDPOINTS.ERRORED_HISTORY, { value: erroredCount }, existingEndpoints);
		await this._updateMaxDayIfInit(endpoint, isInit);
		return endpoint;
	}

	private _toNumber(value?: string | number): number {
		if (typeof value === "number") return Number.isFinite(value) ? value : 0;
		if (typeof value !== "string") return 0;

		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	private _getTimeseriesMaxDay(): string {
		return process.env.TIMESERIES_MAX_DAY || "2";
	}

	private async _updateMaxDayIfInit(endpoints: SpinalNode[] | SpinalNode, isInit: boolean): Promise<void> {
		if (!isInit) return;

		const maxDay = this._getTimeseriesMaxDay();

		if (Array.isArray(endpoints)) {
			await Promise.all(endpoints.map((endpoint) => updateEndpointMaxDay(endpoint, maxDay)));
			return;
		}

		await updateEndpointMaxDay(endpoints, maxDay);
	}
}

export default EndpointService;

import { Controller, Get, Path, Query, Response, Route, SuccessResponse, Tags } from "tsoa";
import EndpointUtils from "../../services/EndpointUtils";
import SpinalGraphService from "../../services/SpinalGraphService";
import { ErrorResponse } from "../../interfaces/IResponses";
import { HTTP_RESPONSES } from "../../utils/HTTP_RESPONSE";
import { METRICS_ENDPOINTS, PM2_ENDPOINTS } from "../../utils/constants";

type EndpointValueResponse = { id: string; name: string; currentValue: string | number | boolean | null; unit: string | null };
type EndpointTimeSeriesResponse = { id: string; name: string; values: Array<{ date: number; value: number | boolean }> };

@Route("monitoring/endpoints")
@Tags("Monitoring")
export class EndpointController extends Controller {
	private readonly endpointUtils = EndpointUtils.getInstance();
	private readonly spinalGraphService = SpinalGraphService.getInstance();

	@Get("pm2/{key}/ram/value")
	public async getPm2RamHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.RAM_HISTORY.name);
	}

	@Get("pm2/{key}/ram/timeseries")
	public async getPm2RamHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.RAM_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/cpu/value")
	public async getPm2CpuHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.CPU_HISTORY.name);
	}

	@Get("pm2/{key}/cpu/timeseries")
	public async getPm2CpuHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.CPU_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/heap_size/value")
	public async getPm2HeapSizeHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
	}

	@Get("pm2/{key}/heap_size/timeseries")
	public async getPm2HeapSizeHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/heap_usage/value")
	public async getPm2HeapUsageHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
	}

	@Get("pm2/{key}/heap_usage/timeseries")
	public async getPm2HeapUsageHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/heap_used_size/value")
	public async getPm2HeapUsedSizeHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);
	}

	@Get("pm2/{key}/heap_used_size/timeseries")
	public async getPm2HeapUsedSizeHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/reboot/value")
	public async getPm2RebootHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.REBOOT_HISTORY.name);
	}

	@Get("pm2/{key}/reboot/timeseries")
	public async getPm2RebootHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.REBOOT_HISTORY.name, startTime, endTime);
	}

	@Get("pm2/{key}/errored/value")
	public async getPm2ErroredHistoryValue(@Path() key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(key, PM2_ENDPOINTS.ERRORED_HISTORY.name);
	}

	@Get("pm2/{key}/errored/timeseries")
	public async getPm2ErroredHistoryTimeseries(@Path() key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(key, PM2_ENDPOINTS.ERRORED_HISTORY.name, startTime, endTime);
	}

	@Get("vm/cpu_usage/value")
	public async getVmCpuUsageValue(): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(METRICS_ENDPOINTS.CPU_USAGE.name);
	}

	@Get("vm/cpu_usage/timeseries")
	public async getVmCpuUsageTimeseries(@Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(METRICS_ENDPOINTS.CPU_USAGE.name, startTime, endTime);
	}

	@Get("vm/ram_usage/value")
	public async getVmRamUsageValue(): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(METRICS_ENDPOINTS.RAM_USAGE.name);
	}

	@Get("vm/ram_usage/timeseries")
	public async getVmRamUsageTimeseries(@Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(METRICS_ENDPOINTS.RAM_USAGE.name, startTime, endTime);
	}

	@Get("vm/disk_usage/value")
	public async getVmDiskUsageValue(): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(METRICS_ENDPOINTS.DISK_USAGE.name);
	}

	@Get("vm/disk_usage/timeseries")
	public async getVmDiskUsageTimeseries(@Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(METRICS_ENDPOINTS.DISK_USAGE.name, startTime, endTime);
	}

	private async getPm2EndpointValueByName(key: string, endpointName: string): Promise<EndpointValueResponse | ErrorResponse> {
		try {
			const processNode = this.getPm2NodeFromKey(key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Endpoint '${endpointName}' not found for process '${key}'.` };
			}

			const element = await endpointNode.getElement(true);

			return {
				id: endpointNode.getId().get(),
				name: endpointNode.getName().get(),
				currentValue: element?.currentValue?.get() ?? null,
				unit: element?.unit?.get() ?? null,
			};
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve endpoint value" };
		}
	}

	private async getPm2EndpointTimeSeriesByName(key: string, endpointName: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		try {
			if (typeof startTime !== "number" || typeof endTime !== "number") {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "startTime and endTime query parameters are required" };
			}

			if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "Invalid time range: startTime must be lower than endTime" };
			}

			const processNode = this.getPm2NodeFromKey(key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
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
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve endpoint history" };
		}
	}

	private async getVmEndpointValueByName(endpointName: string): Promise<EndpointValueResponse | ErrorResponse> {
		try {
			const vmContext = this.spinalGraphService.getVmContext();
			if (!vmContext) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: "VM context not initialized." };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(vmContext, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Endpoint '${endpointName}' not found for VM context.` };
			}

			const element = await endpointNode.getElement(true);
			return {
				id: endpointNode.getId().get(),
				name: endpointNode.getName().get(),
				currentValue: element?.currentValue?.get() ?? null,
				unit: element?.unit?.get() ?? null,
			};
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve VM endpoint value" };
		}
	}

	private async getVmEndpointTimeSeriesByName(endpointName: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		try {
			if (typeof startTime !== "number" || typeof endTime !== "number") {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "startTime and endTime query parameters are required" };
			}

			if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "Invalid time range: startTime must be lower than endTime" };
			}

			const vmContext = this.spinalGraphService.getVmContext();
			if (!vmContext) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: "VM context not initialized." };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(vmContext, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
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
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve VM endpoint history" };
		}
	}

	private getPm2NodeFromKey(key: string) {
		return this.spinalGraphService.getPm2NodeByKey(key);
	}
}

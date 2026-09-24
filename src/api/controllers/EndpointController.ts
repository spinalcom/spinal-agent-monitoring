import { Body, Controller, Get, Path, Post, Query, Response, Route, SuccessResponse, Tags } from "tsoa";
import EndpointUtils from "..//services/EndpointService";
import { GraphService } from "../services/GraphService";
import { ActionResponse, ErrorResponse } from "../../interfaces/IResponses";
import { HTTP_RESPONSES } from "../../utils/HTTP_RESPONSE";
import { METRICS_ENDPOINTS, PM2_ENDPOINTS } from "../../utils/constants";
import { SpinalContext, SpinalNode } from "spinal-model-graph";

type EndpointValueResponse = { id: string; name: string; currentValue: string | number | boolean | null; unit: string | null };
type EndpointTimeSeriesResponse = { id: string; name: string; values: Array<{ date: number; value: number | boolean }> };
type UpdateMaxDayBody = { maxDay: number | string };

@Route("monitoring/endpoints")
@Tags("Monitoring")
export class EndpointController extends Controller {
	private readonly endpointUtils = EndpointUtils.getInstance();
	private readonly VMGraphServiceInstance = GraphService.getInstance();

	@Get("{vmKey}/pm2/{pm2Key}/ram/value")
	public async getPm2RamHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.RAM_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/ram/timeseries")
	public async getPm2RamHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.RAM_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/cpu/value")
	public async getPm2CpuHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.CPU_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/cpu/timeseries")
	public async getPm2CpuHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.CPU_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_size/value")
	public async getPm2HeapSizeHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_size/timeseries")
	public async getPm2HeapSizeHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_usage/value")
	public async getPm2HeapUsageHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_usage/timeseries")
	public async getPm2HeapUsageHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_used_size/value")
	public async getPm2HeapUsedSizeHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/heap_used_size/timeseries")
	public async getPm2HeapUsedSizeHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/reboot/value")
	public async getPm2RebootHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.REBOOT_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/reboot/timeseries")
	public async getPm2RebootHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.REBOOT_HISTORY.name, startTime, endTime);
	}

	@Get("{vmKey}/pm2/{pm2Key}/errored/value")
	public async getPm2ErroredHistoryValue(@Path() vmKey: string, @Path() pm2Key: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getPm2EndpointValueByName(vmKey, pm2Key, PM2_ENDPOINTS.ERRORED_HISTORY.name);
	}

	@Get("{vmKey}/pm2/{pm2Key}/errored/timeseries")
	public async getPm2ErroredHistoryTimeseries(@Path() vmKey: string, @Path() pm2Key: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getPm2EndpointTimeSeriesByName(vmKey, pm2Key, PM2_ENDPOINTS.ERRORED_HISTORY.name, startTime, endTime);
	}

	@Post("{vmKey}/pm2/{pm2Key}/{endpoint}/timeseries/maxDay")
	public async updatePm2EndpointMaxDay(@Path() vmKey: string, @Path() pm2Key: string, @Path() endpoint: string, @Body() body: UpdateMaxDayBody): Promise<ActionResponse | ErrorResponse> {
		try {
			const parsedMaxDay = Number(body?.maxDay);
			if (!Number.isFinite(parsedMaxDay) || parsedMaxDay <= 0) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "maxDay is required and must be a number greater than 0" };
			}

			const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);
			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
			}

			const endpointName = this.resolvePm2EndpointName(endpoint);
			if (!endpointName) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: `Unknown PM2 endpoint '${endpoint}'.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Endpoint '${endpointName}' not found for process '${pm2Key}'.` };
			}

			await this.endpointUtils.updateEndpointMaxDay(endpointNode, parsedMaxDay);
			return {
				message: `Updated timeSeries maxDay for '${endpointName}' on process '${pm2Key}'.`,
				success: true,
				key: pm2Key,
			};
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to update PM2 endpoint maxDay" };
		}
	}

	@Get("{vmKey}/vm/cpu_usage/value")
	public async getVmCpuUsageValue(@Path() vmKey: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(vmKey, METRICS_ENDPOINTS.CPU_USAGE.name);
	}

	@Get("{vmKey}/vm/cpu_usage/timeseries")
	public async getVmCpuUsageTimeseries(@Path() vmKey: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(vmKey, METRICS_ENDPOINTS.CPU_USAGE.name, startTime, endTime);
	}

	@Get("{vmKey}/vm/ram_usage/value")
	public async getVmRamUsageValue(@Path() vmKey: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(vmKey, METRICS_ENDPOINTS.RAM_USAGE.name);
	}

	@Get("{vmKey}/vm/ram_usage/timeseries")
	public async getVmRamUsageTimeseries(@Path() vmKey: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(vmKey, METRICS_ENDPOINTS.RAM_USAGE.name, startTime, endTime);
	}

	@Get("{vmKey}/vm/disk_usage/value")
	public async getVmDiskUsageValue(@Path() vmKey: string): Promise<EndpointValueResponse | ErrorResponse> {
		return this.getVmEndpointValueByName(vmKey, METRICS_ENDPOINTS.DISK_USAGE.name);
	}

	@Get("{vmKey}/vm/disk_usage/timeseries")
	public async getVmDiskUsageTimeseries(@Path() vmKey: string, @Query() startTime?: number, @Query() endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		return this.getVmEndpointTimeSeriesByName(vmKey, METRICS_ENDPOINTS.DISK_USAGE.name, startTime, endTime);
	}

	@Post("{vmKey}/vm/{endpoint}/timeseries/maxDay")
	public async updateVmEndpointMaxDay(@Path() vmKey: string, @Path() endpoint: string, @Body() body: UpdateMaxDayBody): Promise<ActionResponse | ErrorResponse> {
		try {
			const parsedMaxDay = Number(body?.maxDay);
			if (!Number.isFinite(parsedMaxDay) || parsedMaxDay <= 0) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "maxDay is required and must be a number greater than 0" };
			}

			const processNode = await this.getVmContextFromKey(vmKey);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `VM '${vmKey}' not found.` };
			}

			const endpointName = this.resolveVmEndpointName(endpoint);
			if (!endpointName) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: `Unknown endpoint '${endpoint}'.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Endpoint '${endpointName}' not found'.` };
			}

			await this.endpointUtils.updateEndpointMaxDay(endpointNode, parsedMaxDay);
			return {
				message: `Updated timeSeries maxDay for '${endpointName}'.`,
				success: true,
			};
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to update PM2 endpoint maxDay" };
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////
	// PRIVATE METHODS
	////////////////////////////////////////////////////////////////////////////////////////

	private async getPm2EndpointValueByName(vmKey: string, pm2Key: string, endpointName: string): Promise<EndpointValueResponse | ErrorResponse> {
		try {
			const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Endpoint '${endpointName}' not found for process '${pm2Key}'.` };
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

	private async getPm2EndpointTimeSeriesByName(vmKey: string, pm2Key: string, endpointName: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		try {
			startTime = startTime ?? 0;
			endTime = endTime ?? Date.now();

			if (typeof startTime !== "number" || typeof endTime !== "number") {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "startTime and endTime query parameters are required" };
			}

			if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "Invalid time range: startTime must be lower than endTime" };
			}

			const processNode = await this.getPm2NodeFromKey(vmKey, pm2Key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${pm2Key}' not found for VM '${vmKey}'.` };
			}

			const endpointNode = await this.endpointUtils.getEndpointByName(processNode, endpointName);
			if (!endpointNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
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
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve endpoint history" };
		}
	}

	private async getVmEndpointValueByName(vmKey: string, endpointName: string): Promise<EndpointValueResponse | ErrorResponse> {
		try {
			const vmContext = await this.getVmContextFromKey(vmKey);
			if (!vmContext) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `VM '${vmKey}' not found.` };
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

	private async getVmEndpointTimeSeriesByName(vmKey: string, endpointName: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse> {
		try {
			startTime = startTime ?? 0;
			endTime = endTime ?? Date.now();

			if (typeof startTime !== "number" || typeof endTime !== "number") {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "startTime and endTime query parameters are required" };
			}

			if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "Invalid time range: startTime must be lower than endTime" };
			}

			const vmContext = await this.getVmContextFromKey(vmKey);
			if (!vmContext) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `VM '${vmKey}' not found.` };
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

	private async getPm2NodeFromKey(vmKey: string, pm2Key: string): Promise<SpinalNode | undefined> {
		const vmContext = await this.getVmContextFromKey(vmKey);
		if (!vmContext) return undefined;

		return this.VMGraphServiceInstance.getPm2ProcessNodeByKey(vmContext, pm2Key);
	}

	private async getVmContextFromKey(vmKey: string): Promise<SpinalContext | null> {
		return this.VMGraphServiceInstance.getVirtualMachine(vmKey);
	}

	private resolvePm2EndpointName(endpoint: string): string | null {
		const endpointMap: Record<string, string> = {
			ram: PM2_ENDPOINTS.RAM_HISTORY.name,
			cpu: PM2_ENDPOINTS.CPU_HISTORY.name,
			heap_size: PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name,
			heap_usage: PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name,
			heap_used_size: PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name,
			reboot: PM2_ENDPOINTS.REBOOT_HISTORY.name,
			errored: PM2_ENDPOINTS.ERRORED_HISTORY.name,
			ram_history: PM2_ENDPOINTS.RAM_HISTORY.name,
			cpu_history: PM2_ENDPOINTS.CPU_HISTORY.name,
			heap_size_history: PM2_ENDPOINTS.HEAP_SIZE_HISTORY.name,
			heap_usage_history: PM2_ENDPOINTS.HEAP_USAGE_HISTORY.name,
			heap_used_size_history: PM2_ENDPOINTS.HEAP_USED_SIZE_HISTORY.name,
			reboot_history: PM2_ENDPOINTS.REBOOT_HISTORY.name,
			errored_history: PM2_ENDPOINTS.ERRORED_HISTORY.name,
		};

		return endpointMap[endpoint] || null;
	}

	private resolveVmEndpointName(endpoint: string): string | null {
		const endpointMap: Record<string, string> = {
			ram: METRICS_ENDPOINTS.RAM_USAGE.name,
			cpu: METRICS_ENDPOINTS.CPU_USAGE.name,
			disk: METRICS_ENDPOINTS.DISK_USAGE.name,
			ram_usage: METRICS_ENDPOINTS.RAM_USAGE.name,
			cpu_usage: METRICS_ENDPOINTS.CPU_USAGE.name,
			disk_usage: METRICS_ENDPOINTS.DISK_USAGE.name,
		};

		return endpointMap[endpoint] || null;
	}
}

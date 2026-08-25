import { Body, Controller, Get, Path, Post, Query, Response, Route, SuccessResponse, Tags } from "tsoa";
import { ISystemMetrics } from "../../interfaces/interfaces";
import { Pm2Service } from "../../services/Pm2Service";
import SystemOverviewService from "../../services/SystemOverviewService";
import ZabbixSenderService, { Pm2Discovery } from "../../services/ZabbixSenderService";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2ProcessResponse, Pm2StatusSummaryResponse } from "../../interfaces/IResponses";
import { formatProcess, partitionResults, splitActionResults } from "../../utils/pm2Utils";
import { HTTP_RESPONSES } from "../../utils/HTTP_RESPONSE";

@Route("monitoring")
@Tags("Monitoring")
export class MonitoringController extends Controller {
	private readonly pm2Service = Pm2Service.getInstance();
	private readonly systemOverviewService = SystemOverviewService.getInstance();
	private readonly zabbixSenderService = ZabbixSenderService.getInstance();

	/**
	 * Returns a simple health status to confirm the monitoring API is reachable.
	 */
	@Get("health")
	@SuccessResponse("200", "OK")
	public getHealth(): HealthResponse | ErrorResponse {
		try {
			return { status: "ok" };
		} catch (error) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { status: HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve health status" };
		}
	}

	/**
	 * Returns current CPU, memory, and system-level metrics collected by the agent.
	 */
	@Get("system")
	@SuccessResponse("200", "OK")
	public getSystemMetrics(): ISystemMetrics | ErrorResponse {
		try {
			return this.systemOverviewService.getSystemMetricsFormatted();
		} catch (error) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { status: HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve system metrics" };
		}
	}

	/**
	 * Lists all PM2-managed applications with their current runtime state.
	 */
	@Get("apps")
	@SuccessResponse("200", "OK")
	public async getApps(): Promise<Pm2ProcessResponse[] | ErrorResponse> {
		try {
			const processes = await this.pm2Service.getAllPm2Processes();
			return processes.map((process) => formatProcess(process));
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 processes" };
		}
	}

	/**
	 * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
	 */
	@Get("apps/metrics")
	@SuccessResponse("200", "OK")
	public async getAppsMetrics(): Promise<Pm2ProcessMetricsResponse[] | ErrorResponse> {
		try {
			return await this.pm2Service.getPm2MetricsFormatted();
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 metrics" };
		}
	}

	/**
	 * Returns PM2 process counts grouped by status.
	 */
	@Get("apps/status/summary")
	@SuccessResponse("200", "OK")
	public async getAppsStatusSummary(): Promise<Pm2StatusSummaryResponse | ErrorResponse> {
		try {
			return await this.pm2Service.getPm2StatusSummary();
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 status summary" };
		}
	}

	/**
	 * Returns details for a single PM2 application by name or identifier key.
	 * @param key PM2 process key used to find the app.
	 */
	@Get("apps/{key}")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppByKey(@Path() key: string): Promise<Pm2ProcessResponse | ErrorResponse> {
		try {
			const process = await this.pm2Service.getPm2ProcessByKey(key);

			if (!process) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			return formatProcess(process);
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 process" };
		}
	}

	/**
	 * Returns PM2 runtime metrics for one application.
	 * @param key PM2 process key used to find the app.
	 */
	@Get("apps/{key}/metrics")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppMetricsByKey(@Path() key: string): Promise<Pm2ProcessMetricsResponse | ErrorResponse> {
		try {
			const metrics = await this.pm2Service.getPm2ProcessMetricsByKey(key);

			if (!metrics) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			return metrics;
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 process metrics" };
		}
	}

	/**
	 * Returns tailed stdout/stderr logs for one PM2 application.
	 * @param key PM2 process key used to find the app.
	 * @param tail Number of lines to return per stream (1..1000).
	 * @param logType Which stream to return: out, err, or all.
	 */
	@Get("apps/{key}/logs")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppLogsByKey(@Path() key: string, @Query() tail: number = 100, @Query() logType: Pm2LogType = "all"): Promise<Pm2ProcessLogsResponse | ErrorResponse> {
		try {
			const logs = await this.pm2Service.getPm2ProcessLogsByKey(key, tail, logType);

			if (!logs) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			return logs;
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 process logs" };
		}
	}

	/**
	 * Starts one or more PM2 applications.
	 * @param data Request body containing the list of application keys to start.
	 */
	@Post("apps/start")
	@Response<ErrorResponse>(400, "Unable to start process")
	public async startApp(@Body() data: { keys: (string | number)[] }): Promise<{ started: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.startPm2Process(data.keys);
			return partitionResults(result, "started");
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to start PM2 process" };
		}
	}

	/**
	 * Stops one or more PM2 applications.
	 * @param data Request body containing the list of application keys to stop.
	 */
	@Post("apps/stop")
	@Response<ErrorResponse>(400, "Unable to stop process")
	public async stopApp(@Body() data: { keys: (string | number)[] }): Promise<{ stopped: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.stopPm2Process(data.keys);
			return partitionResults(result, "stopped");
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to stop PM2 process" };
		}
	}

	/**
	 * Restarts one or more PM2 applications.
	 * @param data Request body containing the list of application keys to restart.
	 */
	@Post("apps/restart")
	@Response<ErrorResponse>(400, "Unable to restart process")
	public async restartApp(@Body() data: { keys: (string | number)[] }): Promise<{ restarted: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.restartPm2Process(data.keys);
			return partitionResults(result, "restarted");
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to restart PM2 process" };
		}
	}

	/**
	 * Reloads one or more PM2 applications.
	 * @param data Request body containing the list of application keys to reload.
	 */
	@Post("apps/reload")
	@Response<ErrorResponse>(400, "Unable to reload process")
	public async reloadApp(@Body() data: { keys: (string | number)[] }): Promise<{ reloaded: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.reloadPm2Process(data.keys);
			return partitionResults(result, "reloaded");
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to reload PM2 process" };
		}
	}

	/**
	 * Deletes one or more PM2 applications from the process list.
	 * @param data Request body containing the list of application keys to delete.
	 */
	@Post("apps/delete")
	@Response<ErrorResponse>(400, "Unable to delete process")
	public async deleteApp(@Body() data: { keys: (string | number)[] }): Promise<{ deleted: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.deletePm2Process(data.keys);
			return partitionResults(result, "deleted");
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to delete PM2 process" };
		}
	}

	/**
	 * Executes a PM2 action across one or more applications.
	 * @param data Request body containing action and target keys.
	 */
	@Post("apps/action")
	@Response<ErrorResponse>(400, "Invalid PM2 action payload")
	public async runPm2Action(@Body() data: { action: "start" | "stop" | "restart" | "reload" | "delete"; keys: (string | number)[] }): Promise<{ action: string; done: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			if (!Array.isArray(data.keys) || data.keys.length === 0) {
				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
				return { error: "keys must be a non-empty array" };
			}

			const result = await this.pm2Service.runPm2Action(data.action, data.keys);
			const { success, failed } = splitActionResults(result);

			return {
				action: data.action,
				done: success,
				failed,
			};
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to execute PM2 action" };
		}
	}

	/**
	 * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
	 */
	@Get("zabbix/discovery")
	@SuccessResponse("200", "OK")
	public async getZabbixDiscovery(): Promise<Pm2Discovery | ErrorResponse> {
		try {
			return await this.zabbixSenderService.getPm2Discovery();
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to build PM2 discovery payload" };
		}
	}
}

import { Body, Controller, Get, Path, Post, Response, Route, SuccessResponse, Tags } from "tsoa";
import { ISystemMetrics } from "../../interfaces/interfaces";
import { Pm2Service } from "../../services/Pm2Service";
import SystemOverviewService from "../../services/SystemOverviewService";
import ZabbixSenderService, { Pm2Discovery } from "../../services/ZabbixSenderService";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2ProcessResponse } from "../../interfaces/IResponses";
import { formatProcess } from "../../utils/pm2Utils";
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
	 * Starts one or more PM2 applications.
	 * @param data Request body containing the list of application keys to start.
	 */
	@Post("apps/start")
	@Response<ErrorResponse>(400, "Unable to start process")
	public async startApp(@Body() data: { keys: (string | number)[] }): Promise<{ started: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const result = await this.pm2Service.startPm2Process(data.keys);

			return result.reduce(
				(acc, res) => {
					if (res.success) acc.started.push(res);
					else acc.failed.push(res);

					return acc;
				},
				{ started: [] as ActionResponse[], failed: [] as ActionResponse[] },
			);
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

			return result.reduce(
				(acc, res) => {
					if (res.success) acc.stopped.push(res);
					else acc.failed.push(res);

					return acc;
				},
				{ stopped: [] as ActionResponse[], failed: [] as ActionResponse[] },
			);
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

			return result.reduce(
				(acc, res) => {
					if (res.success) acc.restarted.push(res);
					else acc.failed.push(res);

					return acc;
				},
				{ restarted: [] as ActionResponse[], failed: [] as ActionResponse[] },
			);
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to restart PM2 process" };
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

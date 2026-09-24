import { Body, Controller, Get, Path, Post, Query, Response, Route, SuccessResponse, Tags } from "tsoa";
import { GraphService } from "../services/GraphService";
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import ZabbixSenderService, { Pm2Discovery } from "../../system/ZabbixSenderService";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2ProcessResponse, Pm2StatusSummaryResponse } from "../../interfaces/IResponses";
import { formatProcess, partitionResults, splitActionResults } from "../../utils/pm2Utils";
import { HTTP_RESPONSES } from "../../utils/HTTP_RESPONSE";
import { IVMResponse } from "../../interfaces/IVMResponse";
import { IPm2Response } from "../../interfaces";

@Route("monitoring")
@Tags("Monitoring")
export class MonitoringController extends Controller {
	private readonly graphService = GraphService.getInstance();
	// private readonly pm2Service = Pm2Service.getInstance();
	// private readonly systemOverviewService = SystemOverviewService.getInstance();
	// private readonly zabbixSenderService = ZabbixSenderService.getInstance();

	/**
	 * Returns a simple health status to confirm the monitoring API is reachable.
	 */
	@Get("/health")
	@SuccessResponse("200", "OK")
	public getHealth(): HealthResponse | ErrorResponse {
		try {
			return { status: "ok" };
		} catch (error) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { status: HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve health status" };
		}
	}

	@Get("/all_vms")
	@SuccessResponse("200", "OK")
	public async getAllVirtualMachines(): Promise<IVMResponse[] | ErrorResponse> {
		try {
			const vms = await this.graphService.getAllVirtualMachines();
			const result = vms.map((vm) => this._formatVmNode(vm));
			this.setStatus(HTTP_RESPONSES.OK.code);
			return result;
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve virtual machines" };
		}
	}

	@Get("{vmKey}")
	@SuccessResponse("200", "OK")
	public async getVirtualMachine(@Path() vmKey: string): Promise<IVMResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const result = this._formatVmNode(vm);
			this.setStatus(HTTP_RESPONSES.OK.code);
			return result;
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve virtual machine" };
		}
	}

	/**
	 * Returns current CPU, memory, and system-level metrics collected by the agent.
	 */
	@Get("{vmKey}/system")
	@SuccessResponse("200", "OK")
	public async getSystemMetrics(@Path() vmKey: string): Promise<IVMResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const systemMetrics = this._formatVmNode(vm);
			this.setStatus(HTTP_RESPONSES.OK.code);
			return systemMetrics;
		} catch (error) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { status: HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code, message: "Unable to retrieve system metrics" };
		}
	}

	/**
	 * Lists all PM2-managed applications with their current runtime state.
	 */
	@Get("{vmKey}/apps")
	@SuccessResponse("200", "OK")
	public async getApps(@Path() vmKey: string): Promise<Pm2ProcessResponse[] | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processes = await this.graphService.getPm2ProcessesNodes(vm);
			this.setStatus(HTTP_RESPONSES.OK.code);
			return processes.map((process) => this._formatPm2Process(process));
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 processes" };
		}
	}

	/**
	 * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
	 */
	@Get("{vmKey}/apps/metrics")
	@SuccessResponse("200", "OK")
	public async getAppsMetrics(@Path() vmKey: string): Promise<Pm2ProcessMetricsResponse[] | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processes = await this.graphService.getPm2ProcessesNodes(vm);
			this.setStatus(HTTP_RESPONSES.OK.code);
			return processes.map((process) => {
				const info = process.info.get();
				return {
					pm_id: info.pm_id,
					status: info.status,
					restarts: info.restarts,
					uptime: info.uptime,
					heapMemory: info.heapMemory,
					monit: info.monit,
					cwd: info.cwd,
					created_at: info.created_at,
					log: info.log,
				};
			});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 metrics" };
		}
	}

	/**
	 * Returns PM2 process counts grouped by status.
	 */
	@Get("{vmKey}/apps/status/summary")
	@SuccessResponse("200", "OK")
	public async getAppsStatusSummary(@Path() vmKey: string): Promise<Pm2StatusSummaryResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processes = await this.graphService.getPm2ProcessesNodes(vm);

			const summary: Pm2StatusSummaryResponse = processes.reduce((acc, process) => {
				const status: keyof Pm2StatusSummaryResponse = process.info.get().status;
				acc[status] = (acc[status as keyof Pm2StatusSummaryResponse] || 0) + 1;
				return acc;
			}, {} as Pm2StatusSummaryResponse);

			this.setStatus(HTTP_RESPONSES.OK.code);
			return summary;
			// void vmKey;
			// return await this.pm2Service.getPm2StatusSummary();
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 status summary" };
		}
	}

	/**
	 * Returns details for a single PM2 application by name or identifier key.
	 * @param key PM2 process key used to find the app.
	 */
	@Get("{vmKey}/apps/{key}")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppByKey(@Path() vmKey: string, @Path() key: string): Promise<Pm2ProcessResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			this.setStatus(HTTP_RESPONSES.OK.code);
			return this._formatPm2Process(processNode);
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to retrieve PM2 process" };
		}
	}

	/**
	 * Returns PM2 runtime metrics for one application.
	 * @param key PM2 process key used to find the app.
	 */
	@Get("{vmKey}/apps/{key}/metrics")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppMetricsByKey(@Path() vmKey: string, @Path() key: string): Promise<Pm2ProcessMetricsResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			const metrics = this._formatPm2ProcessMetrics(processNode);
			this.setStatus(HTTP_RESPONSES.OK.code);
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
	@Get("{vmKey}/apps/{key}/logs")
	@Response<ErrorResponse>(404, "Process not found")
	public async getAppLogsByKey(@Path() vmKey: string, @Path() key: string, @Query() tail: number = 100, @Query() logType: Pm2LogType = "all"): Promise<Pm2ProcessLogsResponse | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) throw new Error("Virtual machine not found");
			const processNode = await this.graphService.getPm2ProcessNodeByKey(vm, key);

			if (!processNode) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			const logs = await this.graphService.getPm2ProcessLogsByKey(processNode, tail, logType);
			if (!logs) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				return { error: `Process '${key}' not found.` };
			}

			this.setStatus(HTTP_RESPONSES.OK.code);
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
	@Post("{vmKey}/apps/start")
	@Response<ErrorResponse>(400, "Unable to start process")
	public async startApp(@Path() vmKey: string, @Body() data: { keys: (string | number)[] }): Promise<{ started: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				throw new Error("Virtual machine not found");
			}

			return this.graphService
				.executeCommand(vm, "start", data.keys)
				.then((results) => {
					this.setStatus(HTTP_RESPONSES.OK.code);
					return partitionResults(results, "started");
				})
				.catch((err) => {
					this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
					return { error: err.message || "Unable to start PM2 process" };
				});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to start PM2 process" };
		}
	}

	/**
	 * Stops one or more PM2 applications.
	 * @param data Request body containing the list of application keys to stop.
	 */
	@Post("{vmKey}/apps/stop")
	@Response<ErrorResponse>(400, "Unable to stop process")
	public async stopApp(@Path() vmKey: string, @Body() data: { keys: (string | number)[] }): Promise<{ stopped: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				throw new Error("Virtual machine not found");
			}

			return this.graphService
				.executeCommand(vm, "stop", data.keys)
				.then((results) => {
					this.setStatus(HTTP_RESPONSES.OK.code);
					return partitionResults(results, "stopped");
				})
				.catch((err) => {
					this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
					return { error: err.message || "Unable to stop PM2 process" };
				});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to stop PM2 process" };
		}
	}

	/**
	 * Restarts one or more PM2 applications.
	 * @param data Request body containing the list of application keys to restart.
	 */
	@Post("{vmKey}/apps/restart")
	@Response<ErrorResponse>(400, "Unable to restart process")
	public async restartApp(@Path() vmKey: string, @Body() data: { keys: (string | number)[] }): Promise<{ restarted: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			void vmKey;
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				throw new Error("Virtual machine not found");
			}

			return this.graphService
				.executeCommand(vm, "restart", data.keys)
				.then((results) => {
					this.setStatus(HTTP_RESPONSES.OK.code);
					return partitionResults(results, "restarted");
				})
				.catch((err) => {
					this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
					return { error: err.message || "Unable to restart PM2 process" };
				});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to restart PM2 process" };
		}
	}

	/**
	 * Reloads one or more PM2 applications.
	 * @param data Request body containing the list of application keys to reload.
	 */
	@Post("{vmKey}/apps/reload")
	@Response<ErrorResponse>(400, "Unable to reload process")
	public async reloadApp(@Path() vmKey: string, @Body() data: { keys: (string | number)[] }): Promise<{ reloaded: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				throw new Error("Virtual machine not found");
			}

			return this.graphService
				.executeCommand(vm, "reload", data.keys)
				.then((results) => {
					this.setStatus(HTTP_RESPONSES.OK.code);
					return partitionResults(results, "reloaded");
				})
				.catch((err) => {
					this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
					return { error: err.message || "Unable to reload PM2 process" };
				});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to reload PM2 process" };
		}
	}

	/**
	 * Deletes one or more PM2 applications from the process list.
	 * @param data Request body containing the list of application keys to delete.
	 */
	@Post("{vmKey}/apps/delete")
	@Response<ErrorResponse>(400, "Unable to delete process")
	public async deleteApp(@Path() vmKey: string, @Body() data: { keys: (string | number)[] }): Promise<{ deleted: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
		try {
			void vmKey;
			const vm = await this.graphService.getVirtualMachine(vmKey);
			if (!vm) {
				this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
				throw new Error("Virtual machine not found");
			}

			return this.graphService
				.executeCommand(vm, "delete", data.keys)
				.then((results) => {
					this.setStatus(HTTP_RESPONSES.OK.code);
					return partitionResults(results, "deleted");
				})
				.catch((err) => {
					this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
					return { error: err.message || "Unable to delete PM2 process" };
				});
		} catch (error: Error | any) {
			this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
			return { error: error.message || "Unable to delete PM2 process" };
		}
	}

	/**
	 * Executes a PM2 action across one or more applications.
	 * @param data Request body containing action and target keys.
	 */
	// @Post("{vmKey}/apps/action")
	// @Response<ErrorResponse>(400, "Invalid PM2 action payload")
	// public async runPm2Action(@Path() vmKey: string, @Body() data: { action: "start" | "stop" | "restart" | "reload" | "delete"; keys: (string | number)[] }): Promise<{ action: string; done: ActionResponse[]; failed: ActionResponse[] } | ErrorResponse> {
	// 	try {
	// 		const vm = await this.graphService.getVirtualMachine(vmKey);
	// 		if (!vm) {
	// 			this.setStatus(HTTP_RESPONSES.NOT_FOUND.code);
	// 			throw new Error("Virtual machine not found");
	// 		}

	// 		return this.graphService
	// 			.executeCommand(vm, data.action, data.keys)
	// 			.then((results) => {
	// 				this.setStatus(HTTP_RESPONSES.OK.code);
	// 				const dataResult = partitionResults(results, `${data.action}ed`);
	// 				return {
	// 					action: data.action,
	// 					done: dataResult.done || [],
	// 					failed: dataResult.failed || [],
	// 				};
	// 			})
	// 			.catch((err) => {
	// 				this.setStatus(HTTP_RESPONSES.BAD_REQUEST.code);
	// 				return { error: err.message || `Unable to ${data.action} PM2 process` };
	// 			});
	// 	} catch (error: Error | any) {
	// 		this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
	// 		return { error: error.message || "Unable to execute PM2 action" };
	// 	}
	// }

	/**
	 * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
	 */
	// @Get("{vmKey}/zabbix/discovery")
	// @SuccessResponse("200", "OK")
	// public async getZabbixDiscovery(@Path() vmKey: string): Promise<Pm2Discovery | ErrorResponse> {
	// 	try {
	// 		void vmKey;
	// 		return await this.zabbixSenderService.getPm2Discovery();
	// 	} catch (error: Error | any) {
	// 		this.setStatus(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code);
	// 		return { error: error.message || "Unable to build PM2 discovery payload" };
	// 	}
	// }

	private _formatVmNode(vmNode: SpinalContext): IVMResponse {
		const info = vmNode.info.get();
		return {
			name: info.name,
			type: info.type,
			staticId: info.id,
			dynamicId: vmNode._server_id,
			macAddress: info.macAddress,
			ipAddress: info.ipAddress,
			port: info.port,
			cpuUsage: info.cpuUsage,
			ramUsagePercent: info.ramUsagePercent,
			ramUsage: info.ramUsage,
			totalRam: info.totalRam,
			freeRam: info.freeRam,
			totalDisk: info.totalDisk,
			freeDisk: info.freeDisk,
			diskUsage: info.diskUsage,
			diskUsagePercent: info.diskUsagePercent,
			cpuUsagePercent: info.cpuUsagePercent,
			cpuIdle: info.cpuIdle,
			cpuIdlePercent: info.cpuIdlePercent,
		};
	}

	private _formatPm2Process(pm2Process: SpinalNode): Pm2ProcessResponse {
		const info: IPm2Response = pm2Process.info.get();
		return {
			name: info.name,
			staticId: info.staticId,
			dynamicId: info.dynamicId,
			pm_id: info.pm_id,
			status: info.status,
			restarts: info.restarts,
			uptime: info.uptime,
			heapMemory: info.heapMemory,
			monit: info.monit,
			cwd: info.cwd,
		};
	}

	private _formatPm2ProcessMetrics(pm2Process: SpinalNode): Pm2ProcessMetricsResponse {
		const info: IPm2Response = pm2Process.info.get();
		return {
			name: info.name,
			pm_id: info.pm_id,
			status: info.status,
			cpu: info.monit.cpu,
			memory: info.monit.memory,
			uptime: info.uptime,
			restarts: info.restarts,
		};
	}
}

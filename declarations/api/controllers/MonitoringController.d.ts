import { Controller } from "tsoa";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2ProcessResponse, Pm2StatusSummaryResponse } from "../../interfaces/IResponses";
import { IVMResponse } from "../../interfaces/IVMResponse";
export declare class MonitoringController extends Controller {
    private readonly graphService;
    /**
     * Returns a simple health status to confirm the monitoring API is reachable.
     */
    getHealth(): HealthResponse | ErrorResponse;
    getAllVirtualMachines(): Promise<IVMResponse[] | ErrorResponse>;
    getVirtualMachine(vmKey: string): Promise<IVMResponse | ErrorResponse>;
    /**
     * Returns current CPU, memory, and system-level metrics collected by the agent.
     */
    getSystemMetrics(vmKey: string): Promise<IVMResponse | ErrorResponse>;
    /**
     * Lists all PM2-managed applications with their current runtime state.
     */
    getApps(vmKey: string): Promise<Pm2ProcessResponse[] | ErrorResponse>;
    /**
     * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
     */
    getAppsMetrics(vmKey: string): Promise<Pm2ProcessMetricsResponse[] | ErrorResponse>;
    /**
     * Returns PM2 process counts grouped by status.
     */
    getAppsStatusSummary(vmKey: string): Promise<Pm2StatusSummaryResponse | ErrorResponse>;
    /**
     * Returns details for a single PM2 application by name or identifier key.
     * @param key PM2 process key used to find the app.
     */
    getAppByKey(vmKey: string, key: string): Promise<Pm2ProcessResponse | ErrorResponse>;
    /**
     * Returns PM2 runtime metrics for one application.
     * @param key PM2 process key used to find the app.
     */
    getAppMetricsByKey(vmKey: string, key: string): Promise<Pm2ProcessMetricsResponse | ErrorResponse>;
    /**
     * Returns tailed stdout/stderr logs for one PM2 application.
     * @param key PM2 process key used to find the app.
     * @param tail Number of lines to return per stream (1..1000).
     * @param logType Which stream to return: out, err, or all.
     */
    getAppLogsByKey(vmKey: string, key: string, tail?: number, logType?: Pm2LogType): Promise<Pm2ProcessLogsResponse | ErrorResponse>;
    /**
     * Starts one or more PM2 applications.
     * @param data Request body containing the list of application keys to start.
     */
    startApp(vmKey: string, data: {
        keys: (string | number)[];
    }): Promise<{
        started: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Stops one or more PM2 applications.
     * @param data Request body containing the list of application keys to stop.
     */
    stopApp(vmKey: string, data: {
        keys: (string | number)[];
    }): Promise<{
        stopped: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Restarts one or more PM2 applications.
     * @param data Request body containing the list of application keys to restart.
     */
    restartApp(vmKey: string, data: {
        keys: (string | number)[];
    }): Promise<{
        restarted: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Reloads one or more PM2 applications.
     * @param data Request body containing the list of application keys to reload.
     */
    reloadApp(vmKey: string, data: {
        keys: (string | number)[];
    }): Promise<{
        reloaded: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Deletes one or more PM2 applications from the process list.
     * @param data Request body containing the list of application keys to delete.
     */
    deleteApp(vmKey: string, data: {
        keys: (string | number)[];
    }): Promise<{
        deleted: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Executes a PM2 action across one or more applications.
     * @param data Request body containing action and target keys.
     */
    /**
     * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
     */
    private _formatVmNode;
    private _formatPm2Process;
    private _formatPm2ProcessMetrics;
}

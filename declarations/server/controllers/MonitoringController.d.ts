import { Controller } from "tsoa";
import { ISystemMetrics } from "../../interfaces/interfaces";
import { Pm2Discovery } from "../../services/ZabbixSenderService";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2ProcessResponse, Pm2StatusSummaryResponse } from "../../interfaces/IResponses";
export declare class MonitoringController extends Controller {
    private readonly pm2Service;
    private readonly systemOverviewService;
    private readonly zabbixSenderService;
    /**
     * Returns a simple health status to confirm the monitoring API is reachable.
     */
    getHealth(): HealthResponse | ErrorResponse;
    /**
     * Returns current CPU, memory, and system-level metrics collected by the agent.
     */
    getSystemMetrics(): ISystemMetrics | ErrorResponse;
    /**
     * Lists all PM2-managed applications with their current runtime state.
     */
    getApps(): Promise<Pm2ProcessResponse[] | ErrorResponse>;
    /**
     * Lists PM2 metrics (cpu, memory, uptime, status) for all applications.
     */
    getAppsMetrics(): Promise<Pm2ProcessMetricsResponse[] | ErrorResponse>;
    /**
     * Returns PM2 process counts grouped by status.
     */
    getAppsStatusSummary(): Promise<Pm2StatusSummaryResponse | ErrorResponse>;
    /**
     * Returns details for a single PM2 application by name or identifier key.
     * @param key PM2 process key used to find the app.
     */
    getAppByKey(key: string): Promise<Pm2ProcessResponse | ErrorResponse>;
    /**
     * Returns PM2 runtime metrics for one application.
     * @param key PM2 process key used to find the app.
     */
    getAppMetricsByKey(key: string): Promise<Pm2ProcessMetricsResponse | ErrorResponse>;
    /**
     * Returns tailed stdout/stderr logs for one PM2 application.
     * @param key PM2 process key used to find the app.
     * @param tail Number of lines to return per stream (1..1000).
     * @param logType Which stream to return: out, err, or all.
     */
    getAppLogsByKey(key: string, tail?: number, logType?: Pm2LogType): Promise<Pm2ProcessLogsResponse | ErrorResponse>;
    /**
     * Starts one or more PM2 applications.
     * @param data Request body containing the list of application keys to start.
     */
    startApp(data: {
        keys: (string | number)[];
    }): Promise<{
        started: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Stops one or more PM2 applications.
     * @param data Request body containing the list of application keys to stop.
     */
    stopApp(data: {
        keys: (string | number)[];
    }): Promise<{
        stopped: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Restarts one or more PM2 applications.
     * @param data Request body containing the list of application keys to restart.
     */
    restartApp(data: {
        keys: (string | number)[];
    }): Promise<{
        restarted: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Reloads one or more PM2 applications.
     * @param data Request body containing the list of application keys to reload.
     */
    reloadApp(data: {
        keys: (string | number)[];
    }): Promise<{
        reloaded: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Deletes one or more PM2 applications from the process list.
     * @param data Request body containing the list of application keys to delete.
     */
    deleteApp(data: {
        keys: (string | number)[];
    }): Promise<{
        deleted: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Executes a PM2 action across one or more applications.
     * @param data Request body containing action and target keys.
     */
    runPm2Action(data: {
        action: "start" | "stop" | "restart" | "reload" | "delete";
        keys: (string | number)[];
    }): Promise<{
        action: string;
        done: ActionResponse[];
        failed: ActionResponse[];
    } | ErrorResponse>;
    /**
     * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
     */
    getZabbixDiscovery(): Promise<Pm2Discovery | ErrorResponse>;
}

import { Controller } from "tsoa";
import { ISystemMetrics } from "../../interfaces/interfaces";
import { Pm2Discovery } from "../../services/ZabbixSenderService";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2ProcessResponse } from "../../interfaces/IResponses";
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
     * Returns details for a single PM2 application by name or identifier key.
     * @param key PM2 process key used to find the app.
     */
    getAppByKey(key: string): Promise<Pm2ProcessResponse | ErrorResponse>;
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
     * Returns a Zabbix LLD-compatible discovery payload for PM2 processes.
     */
    getZabbixDiscovery(): Promise<Pm2Discovery | ErrorResponse>;
}

export interface ErrorResponse {
    error?: string;
    status?: number;
    message?: string;
}
export interface ActionResponse {
    message: string;
    success?: boolean;
    key?: string | number;
}
export interface HealthResponse {
    status: string;
}
export interface Pm2ProcessResponse {
    name?: string;
    pid?: number;
    pm_id?: number;
    status?: string;
    cpu?: number;
    memory?: number;
    uptime?: number;
    cwd?: string;
    createdAt?: number;
    outLogPath?: string;
    errLogPath?: string;
    restarts?: number;
    staticId?: string;
    dynamicId?: string;
    heapMemory?: any;
    monit?: any;
}
export interface Pm2StatusSummaryResponse {
    total: number;
    online: number;
    stopped: number;
    errored: number;
    other: number;
}
export interface Pm2ProcessMetricsResponse {
    name?: string;
    pm_id?: number;
    status?: string;
    cpu?: number;
    memory?: number;
    uptime?: number;
    restarts?: number;
}
export type Pm2LogType = "out" | "err" | "all";
export interface Pm2ProcessLogsResponse {
    name?: string;
    pm_id?: number;
    tail: number;
    stdout: string[];
    stderr: string[];
}

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
}

import { ProcessDescription } from "pm2";
export interface ILog {
    timeStamp: number;
    message: string;
}
export interface IControlAction {
    actionType: string;
    targetId: string;
    status: string;
    timestamp: string;
    result: string;
}
export interface IGenericOrganData extends ISystemMetrics {
    id: string;
    name: string;
    type: string;
    bootTimestamp: number;
    lastHealthTime: number;
    serverName: string;
    version: string;
    logList: ILog[];
    controlActions: IControlAction[];
}
export interface ISystemMetrics {
    cpuUsage: string;
    ramUsage: string;
    totalRam: string;
    ramUsagePercent?: string;
    freeRam: string;
    totalDisk: string;
    freeDisk: string;
    diskUsage: string;
    diskUsagePercent?: string;
    macAddress?: string;
    ipAddress?: string;
    port?: string | number;
    cpuUsagePercent?: string | number;
    cpuIdle?: string | number;
    cpuIdlePercent?: string | number;
}
export interface IProcessInfo {
    id?: string;
    pid?: number;
    pm_id?: number;
    name?: string;
}
export interface IPM2Process {
    pid: number;
    pm2_id: number;
    name: string;
    status: string;
    alias: string;
    path: string;
    createdAt: number;
    lastUptime: number;
    memory: number;
    cpu: number;
    restarts: number;
}
export interface IRestartCommand {
    targetId: string;
    targetType: string;
    execute: number;
    status: string;
    lastExecuted: string;
    error: string;
}
export interface IRefreshCommand {
    execute: number;
    status: string;
    lastExecuted: string;
}
export interface ICommands {
    restartProcess: IRestartCommand;
    refreshProcesses: IRefreshCommand;
}
export interface IPm2EventData {
    type?: string;
    at: number;
    event?: string;
    data?: any;
    process: ProcessDescription;
    manually: boolean;
}

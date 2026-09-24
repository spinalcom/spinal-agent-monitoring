import { ILog } from "./interfaces";
export interface IPm2Response {
    name: string;
    type: string;
    staticId: string;
    dynamicId: string;
    pm_id: number;
    status: string;
    restarts: number;
    uptime: number;
    heapMemory: IHeapMemory;
    monit: IMonit;
    cwd: string;
    created_at: number;
    log: ILog;
}
export interface IHeapMemory {
    heapSize: IHeapSize;
    heapUsage: IHeapUsage;
    heapUsedSize: IHeapUsedSize;
}
export interface IHeapSize {
    value: string;
    type: string;
    unit: string;
    historic: boolean;
}
export interface IHeapUsage {
    value: number;
    type: string;
    unit: string;
    historic: boolean;
}
export interface IHeapUsedSize {
    value: string;
    type: string;
    unit: string;
    historic: boolean;
}
export interface IMonit {
    memory: number;
    cpu: number;
}

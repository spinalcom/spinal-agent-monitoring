import { ProcessDescription } from "pm2";
import { Pm2ProcessResponse } from "../interfaces/IResponses";
import { Path as SpinalPath } from "spinal-core-connectorjs";
import { Pm2Process } from "../models";
export declare function getHeapInfo(process: ProcessDescription): {
    heapSize: unknown;
    heapUsage: unknown;
    heapUsedSize: unknown;
};
export declare function waitUntil(condition: () => boolean, intervalMs: number): Promise<void>;
export declare function formatProcess(process: ProcessDescription): Pm2ProcessResponse;
export declare function executeCommand(command: "restart" | "stop" | "start", key: string | number): Promise<boolean>;
export declare function getProcessId(process: ProcessDescription): string;
export declare function getProcessStatusCode(process: ProcessDescription): number;
export declare function getProcessLogPath(process: ProcessDescription, logType: "out" | "err"): string | undefined;
export declare function uploadFileNewData(pathModel: SpinalPath, newContent: Buffer): Promise<boolean>;
export declare function convertProcessToObject(processes: Pm2Process[]): {
    [key: string]: Pm2Process;
};
export declare function executeIntervalProcessAction(callback: () => void, intervalMs: number): NodeJS.Timeout;
export declare function _initLogPathInHub(processName: string): SpinalPath;

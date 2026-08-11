import { ProcessDescription } from "pm2";
import { Pm2ProcessResponse } from "../interfaces/IResponses";
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

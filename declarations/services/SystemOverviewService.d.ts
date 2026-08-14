import { ICpuInfo } from "../interfaces/ICpu";
import { IMemoryInfo } from "../interfaces/IMemoryInfo";
import { ISystemMetrics } from "../interfaces/interfaces";
import { SpinalGraph } from "spinal-model-graph";
export default class SystemOverviewService {
    private static _instance;
    private intervalHandle;
    private configFileService;
    private systemMetricsNode;
    private constructor();
    static getInstance(): SystemOverviewService;
    initialize(graph: SpinalGraph): Promise<void>;
    getIpAddress(): string;
    getMacAddress(): string | undefined;
    getCpuInfo(): ICpuInfo;
    getMemoryInfo(): IMemoryInfo;
    getDiskInfo(diskPath?: string): IMemoryInfo;
    getSystemMetrics(): {
        cpu: ICpuInfo;
        memory: IMemoryInfo;
        disk: IMemoryInfo;
    };
    getSystemMetricsFormatted(): ISystemMetrics;
    startPeriodicSystemMetricsPush(intervalMs?: number | string): void;
    private _initSystemMetricsNode;
    updateSystemMetrics(): Promise<void>;
}
export { SystemOverviewService };

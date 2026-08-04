import { ICpuInfo } from "../interfaces/ICpu";
import { IMemoryInfo } from "../interfaces/IMemoryInfo";
import { ISystemMetrics } from "../interfaces/interfaces";
export default class SystemOverviewService {
    private static _instance;
    private intervalHandle;
    private _updateIntervalMs;
    private configFileService;
    private constructor();
    static getInstance(): SystemOverviewService;
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
    startPeriodicSystemMetricsPush(): void;
}
export { SystemOverviewService };

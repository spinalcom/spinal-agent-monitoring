import { ICpuInfo } from "../interfaces/ICpu";
import { IMemoryInfo } from "../interfaces/IMemoryInfo";
import { ISystemMetrics } from "../interfaces/interfaces";
export type SystemAdminAction = "clear-linux-page-cache" | "reboot" | "pm2-resurrect";
export default class SystemOverviewService {
    private static _instance;
    private constructor();
    static getInstance(): SystemOverviewService;
    getIpAddress(): string;
    getMacAddress(): string | undefined;
    getCpuInfo(): ICpuInfo;
    getMemoryInfo(): IMemoryInfo;
    private getCachedMemoryBytes;
    getDiskInfo(diskPath?: string): IMemoryInfo;
    getSystemMetrics(): {
        cpu: ICpuInfo;
        memory: IMemoryInfo;
        disk: IMemoryInfo;
        cachedMemory?: number;
    };
    getSystemMetricsFormatted(): ISystemMetrics;
    executeAdminAction(action: SystemAdminAction): Promise<void>;
    clearLinuxPageCache(): Promise<void>;
    reboot(): Promise<void>;
    private _assertLinux;
}
export { SystemOverviewService };

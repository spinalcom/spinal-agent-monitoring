"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemOverviewService = void 0;
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const util_1 = require("util");
const node_disk_info_1 = require("node-disk-info");
const Pm2Service_1 = __importDefault(require("./Pm2Service"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class SystemOverviewService {
    constructor() { }
    static getInstance() {
        if (!this._instance) {
            this._instance = new SystemOverviewService();
        }
        return this._instance;
    }
    getIpAddress() {
        const networkInterfaces = os_1.default.networkInterfaces();
        for (const iface of Object.values(networkInterfaces)) {
            if (iface) {
                for (const details of iface) {
                    if (!details.internal && details.family === "IPv4") {
                        return details.address;
                    }
                }
            }
        }
        return "Unknown";
    }
    getMacAddress() {
        const interfaces = os_1.default.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name] || []) {
                if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
                    return iface.mac;
                }
            }
        }
        return undefined;
    }
    getCpuInfo() {
        const cpus = os_1.default.cpus();
        let total = 0;
        let used = 0;
        let idle = 0;
        for (const cpu of cpus) {
            const t = cpu.times;
            const coreTotal = t.user + t.nice + t.sys + t.idle + t.irq;
            total += coreTotal;
            idle += t.idle;
            used += coreTotal - t.idle;
        }
        return {
            total,
            used,
            idle,
            usedPercent: Number(((used / total) * 100).toFixed(2)),
            idlePercent: Number(((idle / total) * 100).toFixed(2)),
            unit: "ms",
        };
    }
    getMemoryInfo() {
        const totalMemory = os_1.default.totalmem();
        const freeMemory = os_1.default.freemem();
        const usedMemory = totalMemory - freeMemory;
        return {
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            usedPercent: Number(((usedMemory / totalMemory) * 100).toFixed(2)),
            freePercent: Number(((freeMemory / totalMemory) * 100).toFixed(2)),
            unit: "bytes",
        };
    }
    getCachedMemoryBytes() {
        if (process.platform !== "linux") {
            return undefined;
        }
        const memoryInfo = (0, fs_1.readFileSync)("/proc/meminfo", "utf8");
        const cachedMemory = memoryInfo.match(/^Cached:\s+(\d+)\s+kB$/m);
        if (!cachedMemory) {
            throw new Error("Unable to read cached memory from /proc/meminfo");
        }
        return Number(cachedMemory[1]) * 1024;
    }
    getDiskInfo(diskPath) {
        const disk = (0, node_disk_info_1.getDiskInfoSync)();
        diskPath = diskPath || "/"; // Default to root if no path is provided
        const diskInfo = disk.find((d) => d.mounted === diskPath) || disk[0]; // Fallback to the first disk if the specified path is not found
        return {
            total: Number(((diskInfo.blocks * 1024) / 1e9).toFixed(2)),
            free: Number(((diskInfo.available * 1024) / 1e9).toFixed(2)),
            used: Number((((diskInfo.blocks - diskInfo.available) * 1024) / 1e9).toFixed(2)),
            usedPercent: Number((((diskInfo.blocks - diskInfo.available) / diskInfo.blocks) * 100).toFixed(2)),
            freePercent: Number(((diskInfo.available / diskInfo.blocks) * 100).toFixed(2)),
            unit: "GB",
        };
    }
    getSystemMetrics() {
        const cpuInfo = this.getCpuInfo();
        const memoryInfo = this.getMemoryInfo();
        const diskInfo = this.getDiskInfo();
        const cachedMemory = this.getCachedMemoryBytes();
        return {
            cpu: cpuInfo,
            memory: memoryInfo,
            disk: diskInfo,
            cachedMemory,
        };
    }
    getSystemMetricsFormatted() {
        const systemInfo = this.getSystemMetrics();
        return {
            //cpu
            cpuUsage: systemInfo.cpu.used,
            cpuUsagePercent: systemInfo.cpu.usedPercent,
            cpuIdle: systemInfo.cpu.idle,
            cpuIdlePercent: systemInfo.cpu.idlePercent,
            // ram
            ramUsagePercent: systemInfo.memory.usedPercent,
            ramUsage: systemInfo.memory.used,
            totalRam: systemInfo.memory.total,
            freeRam: systemInfo.memory.free,
            cachedRam: systemInfo.cachedMemory === undefined ? undefined : systemInfo.cachedMemory,
            // disk
            totalDisk: systemInfo.disk.total,
            freeDisk: systemInfo.disk.free,
            diskUsage: systemInfo.disk.used,
            diskUsagePercent: systemInfo.disk.usedPercent,
            // network
            macAddress: this.getMacAddress(),
            ipAddress: this.getIpAddress(),
            //port
            port: process.env.SERVER_PORT || 3000,
        };
    }
    async executeAdminAction(action) {
        switch (action) {
            case "clear-linux-page-cache":
                await this.clearLinuxPageCache();
                return;
            case "reboot":
                await this.reboot();
                return;
            case "pm2-resurrect":
                await Pm2Service_1.default.getInstance().resurrectProcesses();
                return;
            default:
                throw new Error(`Unsupported system action: ${action}`);
        }
    }
    async clearLinuxPageCache() {
        this._assertLinux();
        await execFileAsync("sync", [], { timeout: 30 * 1000 });
        await execFileAsync("sudo", ["-n", "sysctl", "-w", "vm.drop_caches=3"], { timeout: 30 * 1000 });
    }
    async reboot() {
        this._assertLinux();
        await execFileAsync("reboot", [], { timeout: 30 * 1000 });
    }
    _assertLinux() {
        if (process.platform !== "linux") {
            throw new Error("This system action is only supported on Linux");
        }
    }
}
exports.default = SystemOverviewService;
exports.SystemOverviewService = SystemOverviewService;
//# sourceMappingURL=SystemOverviewService.js.map
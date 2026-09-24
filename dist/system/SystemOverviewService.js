"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemOverviewService = void 0;
const os_1 = __importDefault(require("os"));
const node_disk_info_1 = require("node-disk-info");
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
            usedPercent: ((used / total) * 100).toFixed(2),
            idlePercent: ((idle / total) * 100).toFixed(2),
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
            usedPercent: ((usedMemory / totalMemory) * 100).toFixed(2),
            freePercent: ((freeMemory / totalMemory) * 100).toFixed(2),
            unit: "bytes",
        };
    }
    getDiskInfo(diskPath) {
        const disk = (0, node_disk_info_1.getDiskInfoSync)();
        diskPath = diskPath || "/"; // Default to root if no path is provided
        const diskInfo = disk.find((d) => d.mounted === diskPath) || disk[0]; // Fallback to the first disk if the specified path is not found
        return {
            total: ((diskInfo.blocks * 1024) / 1e9).toFixed(2),
            free: ((diskInfo.available * 1024) / 1e9).toFixed(2),
            used: (((diskInfo.blocks - diskInfo.available) * 1024) / 1e9).toFixed(2),
            usedPercent: (((diskInfo.blocks - diskInfo.available) / diskInfo.blocks) * 100).toFixed(2),
            freePercent: ((diskInfo.available / diskInfo.blocks) * 100).toFixed(2),
            unit: "GB",
        };
    }
    getSystemMetrics() {
        const cpuInfo = this.getCpuInfo();
        const memoryInfo = this.getMemoryInfo();
        const diskInfo = this.getDiskInfo();
        return {
            cpu: cpuInfo,
            memory: memoryInfo,
            disk: diskInfo,
        };
    }
    getSystemMetricsFormatted() {
        const systemInfo = this.getSystemMetrics();
        return {
            //cpu
            cpuUsage: systemInfo.cpu.used.toString(),
            // ram
            ramUsagePercent: systemInfo.memory.usedPercent,
            ramUsage: `${systemInfo.memory.used} ${systemInfo.memory.unit}`,
            totalRam: `${systemInfo.memory.total} ${systemInfo.memory.unit}`,
            freeRam: `${systemInfo.memory.free} ${systemInfo.memory.unit}`,
            // disk
            totalDisk: `${systemInfo.disk.total} ${systemInfo.disk.unit}`,
            freeDisk: `${systemInfo.disk.free} ${systemInfo.disk.unit}`,
            diskUsage: `${systemInfo.disk.used} ${systemInfo.disk.unit}`,
            diskUsagePercent: systemInfo.disk.usedPercent,
            // network
            macAddress: this.getMacAddress(),
            ipAddress: this.getIpAddress(),
            //port
            port: process.env.SERVER_PORT || 3000,
        };
    }
}
exports.default = SystemOverviewService;
exports.SystemOverviewService = SystemOverviewService;
//# sourceMappingURL=SystemOverviewService.js.map
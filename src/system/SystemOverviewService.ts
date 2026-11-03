import os from "os";
import { execFile } from "child_process";
import { readFileSync } from "fs";
import { promisify } from "util";
import { ICpuInfo } from "../interfaces/ICpu";
import { IMemoryInfo } from "../interfaces/IMemoryInfo";
import { getDiskInfoSync } from "node-disk-info";
import { ISystemMetrics } from "../interfaces/interfaces";
import Pm2Service from "./Pm2Service";

const execFileAsync = promisify(execFile);

export type SystemAdminAction = "clear-linux-page-cache" | "reboot" | "pm2-resurrect";

export default class SystemOverviewService {
	private static _instance: SystemOverviewService;

	private constructor() {}

	static getInstance(): SystemOverviewService {
		if (!this._instance) {
			this._instance = new SystemOverviewService();
		}
		return this._instance;
	}

	public getIpAddress(): string {
		const networkInterfaces = os.networkInterfaces();
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

	public getMacAddress(): string | undefined {
		const interfaces = os.networkInterfaces();
		for (const name of Object.keys(interfaces)) {
			for (const iface of interfaces[name] || []) {
				if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
					return iface.mac;
				}
			}
		}
		return undefined;
	}

	public getCpuInfo(): ICpuInfo {
		const cpus = os.cpus();
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

	public getMemoryInfo(): IMemoryInfo {
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
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

	private getCachedMemoryBytes(): number | undefined {
		if (process.platform !== "linux") {
			return undefined;
		}

		const memoryInfo = readFileSync("/proc/meminfo", "utf8");
		const cachedMemory = memoryInfo.match(/^Cached:\s+(\d+)\s+kB$/m);
		if (!cachedMemory) {
			throw new Error("Unable to read cached memory from /proc/meminfo");
		}

		return Number(cachedMemory[1]) * 1024;
	}

	public getDiskInfo(diskPath?: string): IMemoryInfo {
		const disk = getDiskInfoSync();
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

	public getSystemMetrics(): { cpu: ICpuInfo; memory: IMemoryInfo; disk: IMemoryInfo; cachedMemory?: number } {
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

	public getSystemMetricsFormatted(): ISystemMetrics {
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

	public async executeAdminAction(action: SystemAdminAction): Promise<void> {
		switch (action) {
			case "clear-linux-page-cache":
				await this.clearLinuxPageCache();
				return;
			case "reboot":
				await this.reboot();
				return;
			case "pm2-resurrect":
				await Pm2Service.getInstance().resurrectProcesses();
				return;
			default:
				throw new Error(`Unsupported system action: ${action}`);
		}
	}

	public async clearLinuxPageCache(): Promise<void> {
		this._assertLinux();
		await execFileAsync("sync", [], { timeout: 30 * 1000 });
		await execFileAsync("sudo", ["-n", "sysctl", "-w", "vm.drop_caches=3"], { timeout: 30 * 1000 });
	}

	public async reboot(): Promise<void> {
		this._assertLinux();
		await execFileAsync("reboot", [], { timeout: 30 * 1000 });
	}

	private _assertLinux(): void {
		if (process.platform !== "linux") {
			throw new Error("This system action is only supported on Linux");
		}
	}
}

export { SystemOverviewService };

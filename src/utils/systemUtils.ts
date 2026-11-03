import { ISystemMetrics } from "../interfaces/interfaces";
import * as os from "os";

export function getDefaultSystemMetrics(): ISystemMetrics {
	return {
		macAddress: "",
		ipAddress: "",
		ramUsage: 0,
		totalRam: 0,
		freeRam: 0,
		cachedRam: 0,
		cpuUsage: 0,
		totalDisk: 0,
		freeDisk: 0,
		diskUsage: 0,
		diskUsagePercent: 0,
	};
}

export function getAgentHostName(): string {
	return process.env.AGENT_NAME || os.hostname();
}

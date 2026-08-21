import { ISystemMetrics } from "../interfaces/interfaces";
import * as os from "os";

export function getDefaultSystemMetrics(): ISystemMetrics {
	return {
		macAddress: "",
		ipAddress: "",
		ramUsage: "",
		totalRam: "",
		freeRam: "",
		cpuUsage: "",
		totalDisk: "",
		freeDisk: "",
		diskUsage: "",
	};
}

export function getAgentHostName(): string {
	return process.env.AGENT_NAME || os.hostname();
}

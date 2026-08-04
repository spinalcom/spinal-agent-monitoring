import { ISystemMetrics } from "../interfaces/interfaces";
import { config } from "./config";
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
	return config.monitoringApiConfig.organName || os.hostname();
}

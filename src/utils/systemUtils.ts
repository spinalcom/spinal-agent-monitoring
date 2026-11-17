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

export function isLocalAddress(ipAddress: string): boolean {
	const localAddresses = ["127.0.0.1", "localhost"];
	return localAddresses.includes(ipAddress);
}

export function getIpAddress(): string {
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

export function getHubInfo(): { host: string; port: number } | null {
	let host = process.env.SPINALHUB_IP || "";
	let port = process.env.SPINALHUB_PORT || "";

	if (port.length === 0) return null;
	if (!port.endsWith("0")) port = port.replace(/.$/, "0");

	if (!host) return null;

	if (isLocalAddress(host)) host = getIpAddress();
	return { host, port: Number(port) };
}

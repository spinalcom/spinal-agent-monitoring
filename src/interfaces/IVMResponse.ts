export interface IVMResponse extends IVMMetrics {
	name?: string;
	type?: string;
	staticId?: string;
	dynamicId?: number | string;
	macAddress?: string;
	ipAddress?: string;
	port?: string;
	cpuUsagePercent?: string;
	cpuIdle?: string;
	cpuIdlePercent?: string;
}

export interface IVMMetrics {
	cpuUsage?: string;
	ramUsagePercent?: string;
	ramUsage?: string;
	totalRam?: string;
	freeRam?: string;
	totalDisk?: string;
	freeDisk?: string;
	diskUsage?: string;
	diskUsagePercent?: string;
}

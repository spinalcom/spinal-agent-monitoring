import { SpinalContext, SpinalNode } from "spinal-model-graph";
import { IVMResponse } from "../../interfaces/IVMResponse";
import { IPm2Response } from "../../interfaces";
import { ActionResponse, ErrorResponse, HealthResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2ProcessResponse, Pm2StatusSummaryResponse } from "../../interfaces/IResponses";

export function _formatVmNode(vmNode: SpinalContext): IVMResponse {
	const info = vmNode.info.get();
	return {
		name: info.name,
		type: info.type,
		staticId: info.id,
		dynamicId: vmNode._server_id,
		macAddress: info.macAddress,
		ipAddress: info.ipAddress,
		port: info.port,
		cpuUsage: info.cpuUsage,
		ramUsagePercent: info.ramUsagePercent,
		ramUsage: info.ramUsage,
		totalRam: info.totalRam,
		freeRam: info.freeRam,
		totalDisk: info.totalDisk,
		freeDisk: info.freeDisk,
		diskUsage: info.diskUsage,
		diskUsagePercent: info.diskUsagePercent,
		cpuUsagePercent: info.cpuUsagePercent,
		cpuIdle: info.cpuIdle,
		cpuIdlePercent: info.cpuIdlePercent,
	};
}

export function _formatPm2Process(pm2Process: SpinalNode): Pm2ProcessResponse {
	const info: IPm2Response = pm2Process.info.get();

	return {
		name: info.name,
		staticId: info.staticId,
		dynamicId: info.dynamicId,
		pm_id: info.pm_id,
		pid: info.pid,
		status: info.status,
		restarts: info.restarts,
		uptime: info.uptime,
		heapMemory: info.heapMemory,
		createdAt: info.created_at,
		monit: info.monit,
		cwd: info.cwd,
		outLogPath: info.log?.out || "",
		errLogPath: info.log?.err || "",
		bosData: _getBosData(info),
	};
}

export function _formatPm2ProcessMetrics(pm2Process: SpinalNode): Pm2ProcessMetricsResponse {
	const info: IPm2Response = pm2Process.info.get();
	return {
		name: info.name,
		pm_id: info.pm_id,
		status: info.status,
		cpu: info.monit.cpu,
		memory: info.monit.memory,
		uptime: info.uptime,
		restarts: info.restarts,
	};
}

export function _getBosData(info: IPm2Response): Record<string, any> {
	const bosName = info.hubData?.bosName || getBosNameFromPath(info.cwd);
	return {
		bosName,
		...(info.hubData || {}),
	};
}

export function getBosNameFromPath(path: string): string {
	const splittedPath = path.split("/");

	const spinalcomIndex = splittedPath.findIndex((segment) => segment.toLowerCase() === "spinalcom");

	if (spinalcomIndex !== -1 && spinalcomIndex + 1 < splittedPath.length) {
		return splittedPath[spinalcomIndex + 1];
	}

	return "";
}

import { ProcessDescription } from "pm2";
import SystemOverviewService from "../system/SystemOverviewService";
import { Pm2Discovery, ZabbixMetric } from "../system/ZabbixSenderService";
import { getAgentHostName } from "./systemUtils";
import { getProcessId, getProcessStatusCode } from "./pm2Utils";

export function _generateZabbixMetrics(systemMetrics: ReturnType<SystemOverviewService["getSystemMetrics"]>, pm2Processes: ProcessDescription[], discovery: Pm2Discovery): ZabbixMetric[] {
	const metrics: ZabbixMetric[] = [
		{ key: "agent.ping", value: 1 },
		{ key: "agent.hostname", value: getAgentHostName() },
		{ key: "system.cpu.util", value: Number(systemMetrics.cpu.usedPercent) },
		{ key: "vm.memory.size[total]", value: Number(systemMetrics.memory.total) },
		{ key: "vm.memory.size[free]", value: Number(systemMetrics.memory.free) },
		{ key: "vm.memory.size[used]", value: Number(systemMetrics.memory.used) },
		{ key: "vfs.fs.size[/,total]", value: toBytesFromGb(systemMetrics.disk.total) },
		{ key: "vfs.fs.size[/,free]", value: toBytesFromGb(systemMetrics.disk.free) },
		{ key: "vfs.fs.size[/,used]", value: toBytesFromGb(systemMetrics.disk.used) },
		{ key: "pm2.proc.count", value: pm2Processes.length },
		{ key: "pm2.discovery", value: JSON.stringify(discovery) },
	];

	for (const process of pm2Processes) {
		const processId = getProcessId(process);
		const status = getProcessStatusCode(process);
		const cpu = Number((process.monit as { cpu?: number } | undefined)?.cpu || 0);
		const memory = Number((process.monit as { memory?: number } | undefined)?.memory || 0);

		metrics.push({ key: `pm2.proc.status[${processId}]`, value: status });
		metrics.push({ key: `pm2.proc.cpu[${processId}]`, value: cpu });
		metrics.push({ key: `pm2.proc.mem[${processId}]`, value: memory });
	}

	return metrics;
}

function toBytesFromGb(value: number | string): number {
	const numeric = Number(value);
	if (Number.isNaN(numeric)) {
		return 0;
	}

	return Math.round(numeric * 1e9);
}

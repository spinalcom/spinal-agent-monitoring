import { ProcessDescription } from "pm2";
import { Pm2ProcessResponse } from "../interfaces/IResponses";
import pm2 from "pm2";

export function getHeapInfo(process: ProcessDescription) {
	const pm2Env = process.pm2_env as { [key: string]: unknown } | undefined;
	const axmMonitor = pm2Env?.axm_monitor as Record<string, unknown> | undefined;

	const heapSize = axmMonitor?.["Heap Size"];
	const heapUsage = axmMonitor?.["Heap Usage"];
	const heapUsedSize = axmMonitor?.["Used Heap Size"];

	return {
		heapSize,
		heapUsage,
		heapUsedSize,
	};
}

export async function waitUntil(condition: () => boolean, intervalMs: number): Promise<void> {
	await new Promise<void>((resolve) => {
		const check = () => {
			if (condition()) {
				resolve();
				return;
			}

			setTimeout(check, intervalMs);
		};

		check();
	});
}

export function formatProcess(process: ProcessDescription): Pm2ProcessResponse {
	const pm2Env = process.pm2_env as { [key: string]: unknown } | undefined;
	const monit = process.monit as { cpu?: number; memory?: number } | undefined;

	return {
		name: process.name,
		pid: process.pid,
		pm_id: process.pm_id,
		status: (pm2Env?.status as string | undefined) ?? undefined,
		cpu: monit?.cpu,
		memory: monit?.memory,
		uptime: (pm2Env?.pm_uptime as number | undefined) ?? undefined,
		cwd: (pm2Env?.cwd as string | undefined) ?? undefined,
		createdAt: (pm2Env?.created_at as number | undefined) ?? undefined,
		outLogPath: (pm2Env?.pm_out_log_path as string | undefined) ?? undefined,
		errLogPath: (pm2Env?.pm_err_log_path as string | undefined) ?? undefined,
	};
}

export async function executeCommand(command: "restart" | "stop" | "start", key: string | number): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		pm2[command](key.toString(), (err: any) => {
			if (err) {
				reject(false);
			} else {
				resolve(true);
			}
		});
	});
}

export function getProcessId(process: ProcessDescription): string {
	if (typeof process.pm_id === "number") {
		return process.pm_id.toString();
	}

	if (typeof process.pid === "number") {
		return process.pid.toString();
	}

	return process.name || "unknown";
}

export function getProcessStatusCode(process: ProcessDescription): number {
	const rawStatus = (process.pm2_env as { status?: string } | undefined)?.status || "";
	const status = rawStatus.toLowerCase();

	if (status === "online") {
		return 1;
	}

	if (status === "stopped" || status === "stopping" || status === "errored") {
		return 0;
	}

	return -1;
}

export function getProcessLogPath(process: ProcessDescription, logType: "out" | "err"): string | undefined {
	const formattedProcess = formatProcess(process); // Ensure the process is formatted before accessing log paths
	return logType === "err" ? formattedProcess.errLogPath : formattedProcess.outLogPath;
}

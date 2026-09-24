import { ProcessDescription } from "pm2";
import { ActionResponse, Pm2ProcessResponse } from "../interfaces/IResponses";
import pm2 from "pm2";
import { Path as SpinalPath, FileSystem, getUrlPath, File as SpinalFile } from "spinal-core-connectorjs";
// import { Pm2Process } from "../spinal-monitoring-service/models";
import * as fs from "fs";
import axios from "axios";

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
		restarts: (pm2Env?.restart_time as number | undefined) ?? 0,
		uptime: (pm2Env?.pm_uptime as number | undefined) ?? undefined,
		cwd: (pm2Env?.cwd as string | undefined) ?? undefined,
		createdAt: (pm2Env?.created_at as number | undefined) ?? undefined,
		outLogPath: (pm2Env?.pm_out_log_path as string | undefined) ?? undefined,
		errLogPath: (pm2Env?.pm_err_log_path as string | undefined) ?? undefined,
	};
}

export async function executeCommand(command: "restart" | "stop" | "start" | "reload" | "delete", key: string | number): Promise<boolean> {
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

export async function uploadFileNewData(pathModel: SpinalPath, newContent: Buffer): Promise<boolean> {
	try {
		// console.log(`Uploading new data to path: ${pathModel._server_id}`);

		// any type is used to avoid TypeScript errors
		const fs: any = FileSystem.get_inst();

		let path = getUrlPath(fs._protocol, fs._url, fs._port, `?s=${fs._session_num}&p=${pathModel._server_id}`);
		const contentType = pathModel.mimeType ? pathModel.mimeType : "application/octet-stream";
		pathModel.remaining.set(newContent.byteLength);
		await fs._axiosInst.put(path, newContent, {
			headers: {
				"X-Content-Type": contentType,
			},
		});
		pathModel.remaining.set(0);
		return true;
	} catch (error) {
		return false;
	}
}

export async function readFileContent(pathModel: SpinalPath): Promise<string[] | null> {
	try {
		const fs: any = FileSystem.get_inst();

		let path = getUrlPath(fs._protocol, fs._url, fs._port, `sceen/_?u=${pathModel._server_id}`);
		const response = await axios.get(path, {
			responseType: "text",
		});

		const content = typeof response.data === "string" ? response.data : String(response.data ?? "");
		return content.split(/\r?\n/);
	} catch (error) {
		return null;
	}
}

// export function convertProcessToObject(processes: Pm2Process[]): { [key: string]: Pm2Process } {
// 	const processObj: { [key: string]: Pm2Process } = {};

// 	for (const process of processes) {
// 		const processId = process.pm_id.get()?.toString() || process.name.get() || "unknown";
// 		processObj[processId] = process;
// 	}

// 	return processObj;
// }

export function executeIntervalProcessAction(callback: () => void, intervalMs: number): NodeJS.Timeout {
	return setInterval(callback, intervalMs);
}

export async function _initLogPathInHub(pm2LogPath: string): Promise<SpinalPath> {
	const initialData = await fs.promises.readFile(pm2LogPath, "utf8");
	const buffer = Buffer.from(initialData || "");
	return new SpinalPath(buffer);
}

export function splitActionResults(result: ActionResponse[]): { success: ActionResponse[]; failed: ActionResponse[] } {
	return result.reduce(
		(acc, res) => {
			if (res.success) acc.success.push(res);
			else acc.failed.push(res);

			return acc;
		},
		{ success: [] as ActionResponse[], failed: [] as ActionResponse[] },
	);
}

export function partitionResults<T extends string>(result: ActionResponse[], successKey: T): { [K in T]: ActionResponse[] } & { failed: ActionResponse[] } {
	const { success, failed } = splitActionResults(result);
	return {
		[successKey]: success,
		failed,
	} as { [K in T]: ActionResponse[] } & { failed: ActionResponse[] };
}

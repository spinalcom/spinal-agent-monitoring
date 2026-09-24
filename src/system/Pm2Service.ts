import pm2 from "pm2";
import { executeCommand, formatProcess } from "../utils/pm2Utils";
import { ActionResponse, Pm2LogType, Pm2ProcessLogsResponse, Pm2ProcessMetricsResponse, Pm2StatusSummaryResponse } from "../interfaces/IResponses";
import { SpinalNode } from "spinal-model-graph";
import { _initLogPathInHub } from "../utils";
import * as fs from "fs";
import { IPm2EventData } from "../interfaces";

export type Pm2LogPayload = { pm_id: number; name: string; type: Pm2LogType; file: string; content: string };
export type Pm2LogCallback = (data: Pm2LogPayload) => void;

class Pm2Service {
	private static _instance: Pm2Service;
	private _isConnected: boolean = false;
	public pm2Maps: Map<string | number, SpinalNode> = new Map();
	private logsWatcher: Map<string | number, fs.FSWatcher> = new Map();
	private _pm2LogWatchCallback?: Pm2LogCallback;
	private _pm2LogWatchSyncTimer?: NodeJS.Timeout;
	private _isPm2LogBusSubscribed: boolean = false;

	private constructor() {}

	public static getInstance(): Pm2Service {
		if (!this._instance) this._instance = new Pm2Service();

		return this._instance;
	}

	public async listenToPm2Actions(callback: (data: IPm2EventData) => void): Promise<void> {
		this.subscribeToPm2EventStream(callback);
	}

	//////////////////////////////////////////////////////////////////////
	//  methods to interact with PM2
	//////////////////////////////////////////////////////////////////////

	public async watchPm2Logs(callback: Pm2LogCallback): Promise<void> {
		this._pm2LogWatchCallback = callback;
		this._subscribeToPm2LogLifecycleEvents();
		await this._syncPm2LogWatchers(true);
	}

	public stopWatchingPm2Logs(): void {
		this._pm2LogWatchCallback = undefined;
		if (this._pm2LogWatchSyncTimer) {
			clearTimeout(this._pm2LogWatchSyncTimer);
			this._pm2LogWatchSyncTimer = undefined;
		}

		for (const watcher of this.logsWatcher.values()) {
			watcher.close();
		}
		this.logsWatcher.clear();
	}

	private _subscribeToPm2LogLifecycleEvents(): void {
		if (this._isPm2LogBusSubscribed) return;
		this._isPm2LogBusSubscribed = true;

		pm2.launchBus((err, bus) => {
			if (err) {
				this._isPm2LogBusSubscribed = false;
				return;
			}

			const scheduleSync = () => this._schedulePm2LogWatchersSync();

			bus.on("process:event", scheduleSync);
			bus.on("process:online", scheduleSync);
			bus.on("process:exit", scheduleSync);
			bus.on("process:delete", scheduleSync);
			bus.on("process:kill", scheduleSync);
			bus.on("process:exception", scheduleSync);
			bus.on("process:config_data_change", scheduleSync);
		});
	}

	private _schedulePm2LogWatchersSync(): void {
		if (!this._pm2LogWatchCallback) return;
		if (this._pm2LogWatchSyncTimer) clearTimeout(this._pm2LogWatchSyncTimer);

		this._pm2LogWatchSyncTimer = setTimeout(() => {
			this._syncPm2LogWatchers(true).catch(() => {});
		}, 200);
	}

	private async _syncPm2LogWatchers(emitInitialContent: boolean): Promise<void> {
		if (!this._pm2LogWatchCallback) return;

		const callback = this._pm2LogWatchCallback;
		const processes = await this.getAllPm2Processes();
		const desiredWatcherKeys = new Set<string>();

		for (const process of processes) {
			for (const target of this._getProcessLogTargets(process)) {
				desiredWatcherKeys.add(target.watcherKey);
				if (this.logsWatcher.has(target.watcherKey)) continue;

				const watcher = await this._createLogWatcher(target, callback, emitInitialContent);
				if (!watcher) continue;

				this.logsWatcher.set(target.watcherKey, watcher);
			}
		}

		for (const [watcherKey, watcher] of this.logsWatcher.entries()) {
			if (desiredWatcherKeys.has(String(watcherKey))) continue;

			watcher.close();
			this.logsWatcher.delete(watcherKey);
		}
	}

	private _getProcessLogTargets(process: pm2.ProcessDescription): Array<{ pm_id: number; name: string; type: Pm2LogType; logPath: string; watcherKey: string }> {
		const pm_id = process.pm_id;
		if (pm_id === undefined) return [];
		if (!this._shouldWatchProcessLogs(process)) return [];

		const name = process.name ?? `pm2-${pm_id}`;
		const env = process.pm2_env as { pm_out_log_path?: string; pm_err_log_path?: string } | undefined;
		const candidates: Array<{ type: Pm2LogType; path?: string }> = [
			{ type: "out", path: env?.pm_out_log_path },
			{ type: "err", path: env?.pm_err_log_path },
		];

		return candidates
			.filter((candidate) => !!candidate.path && fs.existsSync(candidate.path))
			.map((candidate) => {
				const logPath = candidate.path as string;
				return {
					pm_id,
					name,
					type: candidate.type,
					logPath,
					watcherKey: `${pm_id}-${candidate.type}`,
				};
			});
	}

	private _shouldWatchProcessLogs(process: pm2.ProcessDescription): boolean {
		const status = ((process.pm2_env as { status?: string } | undefined)?.status || "").toLowerCase();
		return status === "online" || status === "launching";
	}

	private async _createLogWatcher(target: { pm_id: number; name: string; type: Pm2LogType; logPath: string; watcherKey: string }, callback: Pm2LogCallback, emitInitialContent: boolean): Promise<fs.FSWatcher | null> {
		let position = 0;
		try {
			position = fs.statSync(target.logPath).size;
		} catch (error) {
			return null;
		}

		if (emitInitialContent) {
			await this._emitInitialLogContent(target, callback);
		}

		const watcher = fs.watch(target.logPath, (eventType) => {
			if (eventType !== "change") return;

			this._emitAppendedLogContent(target, callback, position)
				.then((nextPosition) => {
					position = nextPosition;
				})
				.catch(() => {});
		});

		return watcher;
	}

	private async _emitInitialLogContent(target: { pm_id: number; name: string; type: Pm2LogType; logPath: string }, callback: Pm2LogCallback): Promise<void> {
		try {
			const content = await fs.promises.readFile(target.logPath, "utf8");
			if (!content) return;

			callback({
				pm_id: target.pm_id,
				name: target.name,
				type: target.type,
				file: target.logPath,
				content,
			});
		} catch (error) {
			return;
		}
	}

	private async _emitAppendedLogContent(target: { pm_id: number; name: string; type: Pm2LogType; logPath: string }, callback: Pm2LogCallback, currentPosition: number): Promise<number> {
		let size: number;
		try {
			size = fs.statSync(target.logPath).size;
		} catch (error) {
			return currentPosition;
		}

		const content = await fs.promises.readFile(target.logPath, "utf8");
		callback({
			pm_id: target.pm_id,
			name: target.name,
			type: target.type,
			file: target.logPath,
			content,
		});

		return size;
	}

	private _readLogSlice(logPath: string, start: number, end: number): Promise<string> {
		return new Promise<string>((resolve) => {
			const stream = fs.createReadStream(logPath, {
				start,
				end,
				encoding: "utf8",
			});

			let content = "";
			stream.on("data", (chunk) => {
				content += chunk;
			});
			stream.on("end", () => resolve(content));
			stream.on("error", () => resolve(""));
		});
	}

	public async getAllPm2Processes(): Promise<pm2.ProcessDescription[]> {
		try {
			await this._connectToPm2();
			const processes = await this._listPm2Processes();
			return processes;
		} catch (error) {
			return [];
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async getPm2ProcessByKey(key: string): Promise<pm2.ProcessDescription | null> {
		try {
			await this._connectToPm2();
			const processes = await this._listPm2Processes();
			const process = processes.find((p) => p.name == key || p.pm_id?.toString() == key);
			return process || null;
		} catch (error) {
			return null;
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async startPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction("start", processKeys);
	}

	public async stopPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction("stop", processKeys);
	}

	public async restartPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction("restart", processKeys);
	}

	public async reloadPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction("reload", processKeys);
	}

	public async deletePm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction("delete", processKeys);
	}

	public async runPm2Action(action: "start" | "stop" | "restart" | "reload" | "delete", processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return this._executePm2BulkAction(action, processKeys);
	}

	public async getPm2StatusSummary(): Promise<Pm2StatusSummaryResponse> {
		const processes = await this.getAllPm2Processes();
		const summary: Pm2StatusSummaryResponse = {
			total: processes.length,
			online: 0,
			stopped: 0,
			errored: 0,
			other: 0,
		};

		for (const process of processes) {
			const status = ((process.pm2_env as { status?: string } | undefined)?.status || "").toLowerCase();
			if (status === "online") {
				summary.online += 1;
			} else if (status === "stopped" || status === "stopping") {
				summary.stopped += 1;
			} else if (status === "errored") {
				summary.errored += 1;
			} else {
				summary.other += 1;
			}
		}

		return summary;
	}

	public async getPm2ProcessMetricsByKey(key: string): Promise<Pm2ProcessMetricsResponse | null> {
		const process = await this.getPm2ProcessByKey(key);
		if (!process) return null;

		const formatted = formatProcess(process);
		return {
			name: formatted.name,
			pm_id: formatted.pm_id,
			status: formatted.status,
			cpu: formatted.cpu,
			memory: formatted.memory,
			uptime: formatted.uptime,
			restarts: formatted.restarts,
		};
	}

	public async getPm2ProcessLogsByKey(key: string, tail: number = 100, logType: Pm2LogType = "all"): Promise<Pm2ProcessLogsResponse | null> {
		const process = await this.getPm2ProcessByKey(key);
		if (!process) return null;

		const formatted = formatProcess(process);
		const safeTail = Number.isFinite(tail) ? Math.max(1, Math.min(1000, Math.floor(tail))) : 100;

		const stdout = logType === "all" || logType === "out" ? await this._readLogTail(formatted.outLogPath, safeTail) : [];
		const stderr = logType === "all" || logType === "err" ? await this._readLogTail(formatted.errLogPath, safeTail) : [];

		return {
			name: formatted.name,
			pm_id: formatted.pm_id,
			tail: safeTail,
			stdout,
			stderr,
		};
	}

	private async _executePm2BulkAction(action: "start" | "stop" | "restart" | "reload" | "delete", processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		const keys = Array.isArray(processKeys) ? processKeys : [processKeys];
		const messages = {
			start: { success: "Process started successfully", failure: "Failed to start process" },
			stop: { success: "Process stopped successfully", failure: "Failed to stop process" },
			restart: { success: "Process restarted successfully", failure: "Failed to restart process" },
			reload: { success: "Process reloaded successfully", failure: "Failed to reload process" },
			delete: { success: "Process deleted successfully", failure: "Failed to delete process" },
		};

		try {
			await this._connectToPm2();
			const promises = keys.map((key) => executeCommand(action, key));
			const result = await Promise.all(promises);

			return result.map((res, index) => ({
				key: keys[index],
				success: res,
				message: res ? messages[action].success : messages[action].failure,
			}));
		} catch (error) {
			return keys.map((key) => ({
				key,
				success: false,
				message: messages[action].failure,
			}));
		} finally {
			// this._disconnectFromPm2();
		}
	}

	private async _readLogTail(logPath: string | undefined, tail: number): Promise<string[]> {
		if (!logPath) return [];

		try {
			const content = await fs.promises.readFile(logPath, "utf8");
			const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
			return lines.slice(-tail);
		} catch (error) {
			return [];
		}
	}

	private async subscribeToPm2EventStream(callback?: (data: IPm2EventData) => void | Promise<void>): Promise<void> {
		await this._connectToPm2();
		// const callBackWithDebounce = lodash.debounce(callback, 1000);

		pm2.launchBus((err, bus) => {
			if (err) throw err;

			bus.on("process:config_data_change", async (data: any) => {
				data.type = "process:config_data_change";
				if (typeof callback === "function") await callback(data);
			});

			// Listen to general PM2 events (start, stop, restart, etc.)
			bus.on("process:event", async (data: IPm2EventData) => {
				data.type = "process:event";

				if (typeof callback === "function") await callback(data);
				this._savePm2Event(data);
			});
		});
	}

	public async getPm2MetricsFormatted() {
		const processes = await this.getAllPm2Processes();
		const formattedProcesses = processes.map((process) => {
			const formatted = formatProcess(process);
			return {
				name: formatted.name,
				pm_id: formatted.pm_id,
				status: formatted.status,
				cpu: formatted.cpu,
				memory: formatted.memory,
				uptime: formatted.uptime,
			};
		});

		return formattedProcesses;
	}

	private _connectToPm2(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this._isConnected) return resolve();

			pm2.connect((err) => {
				if (err) {
					this._isConnected = false;
					reject(err);
				} else {
					this._isConnected = true;
					resolve();
				}
			});
		});
	}

	private _listPm2Processes(): Promise<pm2.ProcessDescription[]> {
		return new Promise<pm2.ProcessDescription[]>((resolve, reject) => {
			pm2.list((err, processDescriptionList) => {
				if (err) {
					reject(err);
				} else {
					resolve(processDescriptionList);
				}
			});
		});
	}

	private _disconnectFromPm2(): void {
		pm2.disconnect();
	}

	private _savePm2Event(eventData: IPm2EventData) {
		const key = eventData.process?.pm_id ?? eventData.process?.name;
		if (!key) return;

		const processNode = this.pm2Maps.get(key);
		if (!processNode) return;
	}
}

export { Pm2Service };
export default Pm2Service;

import pm2 from "pm2";
import { executeCommand, getHeapInfo } from "../utils/pm2Utils";
import { ActionResponse } from "../interfaces/IResponses";
import * as lodash from "lodash";

class Pm2Service {
	private static _instance: Pm2Service;
	private _isConnected: boolean = false;

	private constructor() {}

	public static getInstance(): Pm2Service {
		if (!this._instance) {
			this._instance = new Pm2Service();
		}

		return this._instance;
	}

	public async initializePm2Service(callback: (data: any) => void): Promise<void> {
		this.listenPm2Events(callback);
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
			const process = processes.find((p) => p.name === key || p.pm_id?.toString() === key);
			return process || null;
		} catch (error) {
			return null;
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async startPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		const keys = Array.isArray(processKeys) ? processKeys : [processKeys];

		try {
			await this._connectToPm2();
			const promises = keys.map((key) => executeCommand("start", key));
			const result = await Promise.all(promises);

			return result.map((res, index) => ({
				key: keys[index],
				success: res,
				message: res ? "Process started successfully" : "Failed to start process",
			}));
		} catch (error) {
			return keys.map((key) => ({
				key,
				success: false,
				message: "Failed to start process",
			}));
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async stopPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		const keys = Array.isArray(processKeys) ? processKeys : [processKeys];

		try {
			await this._connectToPm2();
			const promises = keys.map((key) => executeCommand("stop", key));
			const result = await Promise.all(promises);

			return result.map((res, index) => ({
				key: keys[index],
				success: res,
				message: res ? "Process stopped successfully" : "Failed to stop process",
			}));
		} catch (error) {
			return keys.map((key) => ({
				key,
				success: false,
				message: "Failed to stop process",
			}));
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async restartPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]> {
		const keys = Array.isArray(processKeys) ? processKeys : [processKeys];

		try {
			await this._connectToPm2();
			const promises = keys.map((key) => executeCommand("restart", key));
			const result = await Promise.all(promises);

			return result.map((res, index) => ({
				key: keys[index],
				success: res,
				message: res ? "Process restarted successfully" : "Failed to restart process",
			}));
		} catch (error) {
			return keys.map((key) => ({
				key,
				success: false,
				message: "Failed to restart process",
			}));
		} finally {
			// this._disconnectFromPm2();
		}
	}

	public async listenPm2Events(callback: (data: any) => void): Promise<void> {
		await this._connectToPm2();
		const callBackWithDebounce = lodash.debounce(callback, 1000);

		pm2.launchBus((err, bus) => {
			if (err) throw err;

			bus.on("process:event", (data: any) => {
				callBackWithDebounce(data);
			});
		});
	}

	////////////////////////////////////////////////////////////

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
}

export { Pm2Service };
export default Pm2Service;

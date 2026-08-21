import { ProcessDescription } from "pm2";
import { Model, Path as SpinalPath, spinalCore } from "spinal-core-connectorjs";
import { getHeapInfo, uploadFileNewData, waitUntil } from "../utils/pm2Utils";
import Pm2Service from "../services/Pm2Service";

class Pm2Process extends Model {
	constructor(_process?: ProcessDescription) {
		super();

		if (!_process) return;

		const pm2Env = _process.pm2_env as { [key: string]: unknown } | undefined;

		this.add_attr({
			name: _process.name,
			pm_id: _process.pm_id,
			status: pm2Env?.status,
			restarts: pm2Env?.restart_time,
			uptime: pm2Env?.pm_uptime,
			heapMemory: getHeapInfo(_process),
			monit: {
				memory: _process.monit?.memory,
				cpu: _process.monit?.cpu,
			},
			cwd: pm2Env?.cwd,
			created_at: pm2Env?.created_at,
			log: {
				out: pm2Env?.pm_out_log_path,
				err: pm2Env?.pm_err_log_path,
			},
			// logPathInHub: this._initLogPathInHub(_process.name as string),
		});
	}

	async refreshMetrics() {
		const _process = await Pm2Service.getInstance().getPm2ProcessByKey(this.pm_id);
		if (!_process) return;

		const pm2Env = _process.pm2_env as { [key: string]: unknown } | undefined;

		this.status.set(pm2Env?.status);
		this.restarts.set(pm2Env?.restart_time);
		this.uptime.set(pm2Env?.pm_uptime);
		this.heapMemory.set(getHeapInfo(_process));
		this.monit.set({
			memory: _process.monit?.memory,
			cpu: _process.monit?.cpu,
		});
	}

	updateProcessInfo(_processNewInfo: ProcessDescription) {
		const pm2Env = _processNewInfo.pm2_env as { [key: string]: unknown } | undefined;

		if (this.status) this.status.set(pm2Env?.status);
		if (this.restarts) this.restarts.set(pm2Env?.restart_time);
		if (this.uptime) this.uptime.set(pm2Env?.pm_uptime);
		if (this.heapMemory) this.heapMemory.set(getHeapInfo(_processNewInfo));

		if (this.monit) {
			this.monit.set({
				memory: _processNewInfo.monit?.memory,
				cpu: _processNewInfo.monit?.cpu,
			});
		}

		if (this.cwd) this.cwd.set(pm2Env?.cwd);
		if (this.created_at) this.created_at.set(pm2Env?.created_at);

		if (this.log) {
			this.log.set({
				out: pm2Env?.pm_out_log_path,
				err: pm2Env?.pm_err_log_path,
			});
		}

		// Ensure logPathInHub is initialized if it was not set previously
		if (!this.logPathInHub) this.mod_attr("logPathInHub", this._initLogPathInHub(_processNewInfo.name as string));
	}

	restart() {
		Pm2Service.getInstance().restartPm2Process(this.pm_id);
	}

	stop() {
		Pm2Service.getInstance().stopPm2Process(this.pm_id);
	}

	start() {
		Pm2Service.getInstance().startPm2Process(this.pm_id);
	}

	syncLogFile(newData: Buffer): Promise<boolean> {
		return uploadFileNewData(this.logPathInHub, newData);
	}

	private async _initLogPathInHub(processName: string): Promise<SpinalPath> {
		const buffer = Buffer.from("");
		const file = new File([buffer], `${processName}.log`);
		const path = new SpinalPath(file);
		await waitUntil(() => typeof path._server_id !== "undefined", 1000);
		return path;
	}
}

spinalCore.register_models(Pm2Process, "Pm2Process");
export default Pm2Process;
export { Pm2Process };

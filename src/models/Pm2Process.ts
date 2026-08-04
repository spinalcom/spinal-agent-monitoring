import { ProcessDescription } from "pm2";
import { Model, spinalCore } from "spinal-core-connectorjs";
import { getHeapInfo } from "../utils/pm2Utils";
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

	restart() {
		Pm2Service.getInstance().restartPm2Process(this.pm_id);
	}

	stop() {
		Pm2Service.getInstance().stopPm2Process(this.pm_id);
	}

	start() {
		Pm2Service.getInstance().startPm2Process(this.pm_id);
	}
}

spinalCore.register_models(Pm2Process, "Pm2Process");
export default Pm2Process;
export { Pm2Process };

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pm2Process = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const pm2Utils_1 = require("../utils/pm2Utils");
const Pm2Service_1 = __importDefault(require("../services/Pm2Service"));
class Pm2Process extends spinal_core_connectorjs_1.Model {
    constructor(_process) {
        super();
        if (!_process)
            return;
        const pm2Env = _process.pm2_env;
        this.add_attr({
            name: _process.name,
            pm_id: _process.pm_id,
            status: pm2Env?.status,
            restarts: pm2Env?.restart_time,
            uptime: pm2Env?.pm_uptime,
            heapMemory: (0, pm2Utils_1.getHeapInfo)(_process),
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
        const _process = await Pm2Service_1.default.getInstance().getPm2ProcessByKey(this.pm_id);
        if (!_process)
            return;
        const pm2Env = _process.pm2_env;
        this.status.set(pm2Env?.status);
        this.restarts.set(pm2Env?.restart_time);
        this.uptime.set(pm2Env?.pm_uptime);
        this.heapMemory.set((0, pm2Utils_1.getHeapInfo)(_process));
        this.monit.set({
            memory: _process.monit?.memory,
            cpu: _process.monit?.cpu,
        });
    }
    restart() {
        Pm2Service_1.default.getInstance().restartPm2Process(this.pm_id);
    }
    stop() {
        Pm2Service_1.default.getInstance().stopPm2Process(this.pm_id);
    }
    start() {
        Pm2Service_1.default.getInstance().startPm2Process(this.pm_id);
    }
}
exports.Pm2Process = Pm2Process;
spinal_core_connectorjs_1.spinalCore.register_models(Pm2Process, "Pm2Process");
exports.default = Pm2Process;
//# sourceMappingURL=Pm2Process.js.map
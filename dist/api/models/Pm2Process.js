"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalPm2Process = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const pm2Utils_1 = require("../../utils/pm2Utils");
const Pm2Service_1 = __importDefault(require("../../system/Pm2Service"));
class SpinalPm2Process extends spinal_core_connectorjs_1.Model {
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
            // logPathInHub: this._initLogPathInHub(_process.name as string),
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
    updateProcessInfo(_processNewInfo) {
        const pm2Env = _processNewInfo.pm2_env;
        if (this.status)
            this.status.set(pm2Env?.status);
        if (this.restarts)
            this.restarts.set(pm2Env?.restart_time);
        if (this.uptime)
            this.uptime.set(pm2Env?.pm_uptime);
        if (this.heapMemory)
            this.heapMemory.set((0, pm2Utils_1.getHeapInfo)(_processNewInfo));
        if (this.monit) {
            this.monit.set({
                memory: _processNewInfo.monit?.memory,
                cpu: _processNewInfo.monit?.cpu,
            });
        }
        if (this.cwd)
            this.cwd.set(pm2Env?.cwd);
        if (this.created_at)
            this.created_at.set(pm2Env?.created_at);
        if (this.log) {
            this.log.set({
                out: pm2Env?.pm_out_log_path,
                err: pm2Env?.pm_err_log_path,
            });
        }
        // Ensure logPathInHub is initialized if it was not set previously
        if (!this.logPathInHub)
            this.mod_attr("logPathInHub", this._initLogPathInHub(_processNewInfo.name));
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
    syncLogFile(newData) {
        return (0, pm2Utils_1.uploadFileNewData)(this.logPathInHub, newData);
    }
    async _initLogPathInHub(processName) {
        const buffer = Buffer.from("");
        const file = new File([buffer], `${processName}.log`);
        const path = new spinal_core_connectorjs_1.Path(file);
        await (0, pm2Utils_1.waitUntil)(() => typeof path._server_id !== "undefined", 1000);
        return path;
    }
}
exports.SpinalPm2Process = SpinalPm2Process;
spinal_core_connectorjs_1.spinalCore.register_models(SpinalPm2Process, "SpinalPm2Process");
exports.default = SpinalPm2Process;
//# sourceMappingURL=Pm2Process.js.map
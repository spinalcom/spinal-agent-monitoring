"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileModel = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const systemUtils_1 = require("../utils/systemUtils");
const os = __importStar(require("os"));
const Pm2Process_1 = __importDefault(require("./Pm2Process"));
const constants_1 = require("../utils/constants");
class ConfigFileModel extends spinal_core_connectorjs_1.Model {
    constructor(name, type, serverName, systemInfo) {
        super();
        this.pm2List = [];
        this.add_attr({
            type: ConfigFileModel.FILE_TYPE,
            fileType: ConfigFileModel.FILE_TYPE,
            lastUpdate: Date.now(),
            systemOverView: this._getDefaultHostInfoData(name, type, serverName, systemInfo),
            pm2Processes: new spinal_core_connectorjs_1.Ptr(new spinal_core_connectorjs_1.Lst([])),
            commandList: new spinal_core_connectorjs_1.Lst([]),
        });
    }
    initialize(name, type, serverName, systemInfo) {
        this._checkAttributesExistence("type", ConfigFileModel.FILE_TYPE);
        this._checkAttributesExistence("fileType", ConfigFileModel.FILE_TYPE);
        this._checkAttributesExistence("lastUpdate", Date.now());
        this._checkAttributesExistence("systemOverView", this._getDefaultHostInfoData(name, type, serverName, systemInfo));
        this._checkAttributesExistence("pm2Processes", new spinal_core_connectorjs_1.Ptr(new spinal_core_connectorjs_1.Lst([])));
        this._checkAttributesExistence("commandList", new spinal_core_connectorjs_1.Lst([]));
    }
    updateMetrics(systemInfo) {
        for (const key in systemInfo) {
            if (this.systemOverView[key] && typeof this.systemOverView[key].set === "function") {
                const value = systemInfo[key];
                this.systemOverView[key].set(value);
            }
        }
        this.systemOverView.lastHealthTime.set(Date.now());
        this.lastUpdate.set(Date.now());
    }
    async updatePm2Metrics() {
        if (!this.pm2List || this.pm2List.length === 0)
            return;
        const promises = this.pm2List.map(async (pm2Process) => pm2Process.refreshMetrics());
        await Promise.all(promises);
    }
    async updatePm2Processes(processes) {
        const pm2ProcessesLst = await this.getPm2Processes();
        await pm2ProcessesLst.clear();
        for (const process of processes) {
            const pm2ProcessModel = new Pm2Process_1.default(process);
            pm2ProcessesLst.push(pm2ProcessModel);
        }
        this.lastUpdate.set(Date.now());
        this.pm2List = Array.from(pm2ProcessesLst);
        return pm2ProcessesLst;
    }
    async getPm2Processes() {
        const processes = await this.pm2Processes.load();
        return processes;
    }
    async getPm2ProcessById(key) {
        const processesLst = await this.getPm2Processes();
        for (let i = 0; i < processesLst.length; i++) {
            const process = processesLst[i];
            if (process.pm_id.get() == key || process.pid.get() == key || process.name.get() == key) {
                return process;
            }
        }
    }
    async addCommand(command) {
        this.commandList.push(command);
        this.lastUpdate.set(Date.now());
    }
    bindCommandList() {
        const commandExecuted = new Set();
        this.commandList.bind(async () => {
            for (let i = 0; i < this.commandList.length; i++) {
                const command = this.commandList[i];
                if (command.status.get() == constants_1.SPINAL_COMMAND_STATUS.pending && !commandExecuted.has(command.id.get())) {
                    commandExecuted.add(command.id.get());
                    await this._executeCommand(command);
                }
            }
        });
    }
    _getDefaultHostInfoData(name, type, serverName, systemInfo) {
        return {
            id: Date.now().toString(),
            name: name || "VM Monitoring Agent",
            type: type || "Monitoring",
            bootTimestamp: Date.now(),
            lastHealthTime: Date.now(),
            ...(systemInfo || (0, systemUtils_1.getDefaultSystemMetrics)()),
            serverName: serverName || os.hostname(),
        };
    }
    _executeCommand(command) {
        return command
            .execute()
            .then(() => {
            command.status.set(constants_1.SPINAL_COMMAND_STATUS.completed);
            return true;
        })
            .catch((error) => {
            command.status.set(constants_1.SPINAL_COMMAND_STATUS.failed);
            return false;
        })
            .finally(() => {
            this.commandList.remove(command);
        });
    }
    _checkAttributesExistence(attributeName, value, editIt = false) {
        if (typeof this[attributeName] === "undefined")
            this.add_attr({ [attributeName]: value });
        else if (this[attributeName] && editIt)
            this.mod_attr(attributeName, value);
    }
}
exports.ConfigFileModel = ConfigFileModel;
ConfigFileModel.FILE_TYPE = "AgentMonitoring";
exports.default = ConfigFileModel;
spinal_core_connectorjs_1.spinalCore.register_models(ConfigFileModel, "ConfigFile");
//# sourceMappingURL=ConfigFileModel.js.map
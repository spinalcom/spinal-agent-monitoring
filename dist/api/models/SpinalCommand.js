"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalCommand = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const constants_1 = require("../../utils/constants");
const Pm2Service_1 = require("../../system/Pm2Service");
const SystemOverviewService_1 = __importDefault(require("../../system/SystemOverviewService"));
const utils_1 = require("../../utils");
class SpinalCommand extends spinal_core_connectorjs_1.Model {
    constructor(type, processesIds, vmNode) {
        super();
        this.add_attr({
            id: (0, utils_1.generateUniqId)(),
            type,
            processesIds,
            status: new spinal_core_connectorjs_1.Choice(0, Object.values(constants_1.SPINAL_COMMAND_STATUS)),
            createdAt: Date.now(),
            executedAt: null,
            executionResult: new spinal_core_connectorjs_1.Lst([]),
            vmNode,
        });
    }
    async execute() {
        try {
            const pm2ServiceInstance = Pm2Service_1.Pm2Service.getInstance();
            const systemOverviewServiceInstance = SystemOverviewService_1.default.getInstance();
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.in_progress);
            const type = this.type.get();
            const processesIds = this.processesIds.get();
            const keys = Array.isArray(processesIds) ? processesIds : [processesIds];
            let results = [];
            switch (type) {
                case constants_1.SPINAL_COMMAND_TYPE.start:
                    results = await pm2ServiceInstance.startPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.restart:
                    results = await pm2ServiceInstance.restartPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.stop:
                    results = await pm2ServiceInstance.stopPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.reload:
                    results = await pm2ServiceInstance.reloadPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.delete:
                    results = await pm2ServiceInstance.deletePm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.clearLinuxPageCache:
                    await systemOverviewServiceInstance.executeAdminAction("clear-linux-page-cache");
                    results = [{ success: true, message: "Linux page cache cleared" }];
                    break;
                default:
                    throw new Error(`Unsupported command type: ${type}`);
            }
            this.executionResult.set(results);
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.completed);
            await this.removeFromGraph();
            return results;
        }
        catch (error) {
            const response = { success: false, message: `Command execution failed: ${error.message}` };
            this.executionResult.set([response]);
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.failed);
            await this.removeFromGraph();
            return [response];
        }
    }
    async removeFromGraph() {
        let commandLst = await this.vmNode.info?.pm2_commands?.load();
        if (!commandLst)
            return false;
        for (let i = 0; i < commandLst.length; i++) {
            if (commandLst[i]._server_id === this._server_id) {
                commandLst.splice(i, 1);
                break;
            }
        }
        return true;
    }
    isAvailable() {
        const status = this.status.get();
        return status === constants_1.SPINAL_COMMAND_STATUS.pending && this.isNotExpired();
    }
    isNotExpired() {
        const createdAt = this.createdAt.get();
        const now = Date.now();
        return now - createdAt < constants_1.SPINAL_COMMAND_TIMEOUT_MS;
    }
}
exports.SpinalCommand = SpinalCommand;
spinal_core_connectorjs_1.spinalCore.register_models(SpinalCommand, "SpinalCommand");
exports.default = SpinalCommand;
//# sourceMappingURL=SpinalCommand.js.map
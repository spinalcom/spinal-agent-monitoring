"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalCommand = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const constants_1 = require("../../utils/constants");
const Pm2Service_1 = require("../../system/Pm2Service");
const uuid_1 = require("uuid");
class SpinalCommand extends spinal_core_connectorjs_1.Model {
    constructor(type, processesIds, vmNode) {
        super();
        this.add_attr({
            id: (0, uuid_1.v4)(),
            type,
            processesIds,
            status: new spinal_core_connectorjs_1.Choice(0, Object.values(constants_1.SPINAL_COMMAND_STATUS)),
            createdAt: Date.now(),
            executedAt: null,
            executionResult: new spinal_core_connectorjs_1.Lst([]),
            vmNode,
        });
    }
    async execute(pm2ServiceInstance) {
        try {
            if (!pm2ServiceInstance)
                pm2ServiceInstance = Pm2Service_1.Pm2Service.getInstance();
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
                default:
                    throw new Error(`Unsupported command type: ${type}`);
            }
            this.executionResult.set(results);
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.completed);
            return results;
        }
        catch (error) {
            const response = { success: false, message: `Command execution failed: ${error.message}` };
            this.executionResult.set([response]);
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.failed);
            return [response];
        }
    }
    async removeFromGraph() {
        let commandLst = await this.vmNode.info?.pm2_commands?.load();
        if (!commandLst)
            return false;
        commandLst.remove(this);
        return true;
    }
    isAvailable() {
        const status = this.status.get();
        return status === constants_1.SPINAL_COMMAND_STATUS.pending && this.isNotExpired();
    }
    isNotExpired() {
        const createdAt = this.createdAt.get();
        const now = Date.now();
        const expirationTime = 30 * 1000; // 30 seconds
        return now - createdAt < expirationTime;
    }
}
exports.SpinalCommand = SpinalCommand;
spinal_core_connectorjs_1.spinalCore.register_models(SpinalCommand, "SpinalCommand");
exports.default = SpinalCommand;
//# sourceMappingURL=SpinalCommand.js.map
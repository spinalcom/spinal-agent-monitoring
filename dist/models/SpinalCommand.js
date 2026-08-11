"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalCommand = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const constants_1 = require("../utils/constants");
const Pm2Service_1 = require("../services/Pm2Service");
const uuid_1 = require("uuid");
class SpinalCommand extends spinal_core_connectorjs_1.Model {
    constructor(type, processesIds) {
        super();
        this.add_attr({
            id: (0, uuid_1.v4)(),
            type,
            processesIds,
            status: new spinal_core_connectorjs_1.Choice(0, Object.values(constants_1.SPINAL_COMMAND_STATUS)),
            createdAt: Date.now(),
            executedAt: null,
        });
    }
    async execute() {
        try {
            const pm2ServiceInstance = Pm2Service_1.Pm2Service.getInstance();
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.in_progress);
            const type = this.type.get();
            const processesIds = this.processesIds.get();
            const keys = Array.isArray(processesIds) ? processesIds : [processesIds];
            switch (type) {
                case constants_1.SPINAL_COMMAND_TYPE.start:
                    await pm2ServiceInstance.startPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.restart:
                    await pm2ServiceInstance.restartPm2Process(keys);
                    break;
                case constants_1.SPINAL_COMMAND_TYPE.stop:
                    await pm2ServiceInstance.stopPm2Process(keys);
                    break;
                default:
                    throw new Error(`Unsupported command type: ${type}`);
            }
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.completed);
            return { success: true, message: `Command executed successfully` };
        }
        catch (error) {
            this.status.set(constants_1.SPINAL_COMMAND_STATUS.failed);
            return { success: false, message: `Command execution failed: ${error.message}` };
        }
    }
}
exports.SpinalCommand = SpinalCommand;
spinal_core_connectorjs_1.spinalCore.register_models(SpinalCommand, "SpinalCommand");
exports.default = SpinalCommand;
//# sourceMappingURL=SpinalCommand.js.map
import { Choice, Model, spinalCore } from "spinal-core-connectorjs";
import { SPINAL_COMMAND_STATUS, SPINAL_COMMAND_TYPE } from "../utils/constants";
import { IProcessInfo } from "../interfaces/interfaces";
import { Pm2Service } from "../services/Pm2Service";
import { ActionResponse } from "../interfaces/IResponses";
import { v4 as uuidv4 } from "uuid";

class SpinalCommand extends Model {
	constructor(type?: (typeof SPINAL_COMMAND_TYPE)[keyof typeof SPINAL_COMMAND_TYPE], processesIds?: string | number | (string | number)[]) {
		super();
		this.add_attr({
			id: uuidv4(),
			type,
			processesIds,
			status: new Choice(0, Object.values(SPINAL_COMMAND_STATUS)),
			createdAt: Date.now(),
			executedAt: null,
		});
	}

	async execute(): Promise<ActionResponse> {
		try {
			const pm2ServiceInstance = Pm2Service.getInstance();
			this.status.set(SPINAL_COMMAND_STATUS.in_progress);
			const type = this.type.get();
			const processesIds = this.processesIds.get();
			const keys = Array.isArray(processesIds) ? processesIds : [processesIds];

			switch (type) {
				case SPINAL_COMMAND_TYPE.start:
					await pm2ServiceInstance.startPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.restart:
					await pm2ServiceInstance.restartPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.stop:
					await pm2ServiceInstance.stopPm2Process(keys);
					break;
				default:
					throw new Error(`Unsupported command type: ${type}`);
			}

			this.status.set(SPINAL_COMMAND_STATUS.completed);
			return { success: true, message: `Command executed successfully` };
		} catch (error: any) {
			this.status.set(SPINAL_COMMAND_STATUS.failed);
			return { success: false, message: `Command execution failed: ${error.message}` };
		}
	}

	isAvailable(): boolean {
		const status = this.status.get();
		return status === SPINAL_COMMAND_STATUS.pending && this.isNotExpired();
	}

	isNotExpired(): boolean {
		const createdAt = this.createdAt.get();
		const now = Date.now();
		const expirationTime = 30 * 1000; // 30 seconds

		return now - createdAt < expirationTime;
	}
}

spinalCore.register_models(SpinalCommand, "SpinalCommand");
export { SpinalCommand };
export default SpinalCommand;

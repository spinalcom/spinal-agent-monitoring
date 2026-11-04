import { Choice, Lst, Model, Ptr, spinalCore } from "spinal-core-connectorjs";
import { SPINAL_COMMAND_STATUS, SPINAL_COMMAND_TIMEOUT_MS, SPINAL_COMMAND_TYPE, SpinalCommandAction } from "../../utils/constants";
import { Pm2Service } from "../../system/Pm2Service";
import SystemOverviewService from "../../system/SystemOverviewService";
import { ActionResponse } from "../../interfaces/IResponses";
import type { SpinalContext } from "spinal-model-graph";
import { generateUniqId } from "../../utils";

class SpinalCommand extends Model {
	constructor(type?: SpinalCommandAction, processesIds?: string | number | (string | number)[], vmNode?: SpinalContext) {
		super();
		this.add_attr({
			id: generateUniqId(),
			type,
			processesIds,
			status: new Choice(0, Object.values(SPINAL_COMMAND_STATUS)),
			createdAt: Date.now(),
			executedAt: null,
			executionResult: new Lst([]),
			vmNode,
		});
	}

	async execute(): Promise<ActionResponse[]> {
		try {
			const pm2ServiceInstance = Pm2Service.getInstance();
			const systemOverviewServiceInstance = SystemOverviewService.getInstance();

			this.status.set(SPINAL_COMMAND_STATUS.in_progress);
			const type = this.type.get();
			const processesIds = this.processesIds.get();
			const keys = Array.isArray(processesIds) ? processesIds : [processesIds];

			let results: ActionResponse[] = [];

			switch (type) {
				case SPINAL_COMMAND_TYPE.start:
					results = await pm2ServiceInstance.startPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.restart:
					results = await pm2ServiceInstance.restartPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.stop:
					results = await pm2ServiceInstance.stopPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.reload:
					results = await pm2ServiceInstance.reloadPm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.delete:
					results = await pm2ServiceInstance.deletePm2Process(keys);
					break;
				case SPINAL_COMMAND_TYPE.clearLinuxPageCache:
					await systemOverviewServiceInstance.executeAdminAction("clear-linux-page-cache");
					results = [{ success: true, message: "Linux page cache cleared" }];
					break;
				default:
					throw new Error(`Unsupported command type: ${type}`);
			}

			this.executionResult.set(results);
			this.status.set(SPINAL_COMMAND_STATUS.completed);
			await this.removeFromGraph();
			return results;
		} catch (error: any) {
			const response = { success: false, message: `Command execution failed: ${error.message}` };
			this.executionResult.set([response]);
			this.status.set(SPINAL_COMMAND_STATUS.failed);
			await this.removeFromGraph();
			return [response];
		}
	}

	async removeFromGraph(): Promise<boolean> {
		let commandLst = await this.vmNode.info?.pm2_commands?.load();
		if (!commandLst) return false;

		for (let i = 0; i < commandLst.length; i++) {
			if (commandLst[i]._server_id === this._server_id) {
				commandLst.splice(i, 1);
				break;
			}
		}

		return true;
	}

	isAvailable(): boolean {
		const status = this.status.get();
		return status === SPINAL_COMMAND_STATUS.pending && this.isNotExpired();
	}

	isNotExpired(): boolean {
		const createdAt = this.createdAt.get();
		const now = Date.now();
		return now - createdAt < SPINAL_COMMAND_TIMEOUT_MS;
	}
}

spinalCore.register_models(SpinalCommand, "SpinalCommand");
export { SpinalCommand };
export default SpinalCommand;

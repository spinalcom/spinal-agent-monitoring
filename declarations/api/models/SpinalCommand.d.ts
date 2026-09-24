import { Model } from "spinal-core-connectorjs";
import { SPINAL_COMMAND_TYPE } from "../../utils/constants";
import { Pm2Service } from "../../system/Pm2Service";
import { ActionResponse } from "../../interfaces/IResponses";
import type { SpinalContext } from "spinal-model-graph";
declare class SpinalCommand extends Model {
    constructor(type?: (typeof SPINAL_COMMAND_TYPE)[keyof typeof SPINAL_COMMAND_TYPE], processesIds?: string | number | (string | number)[], vmNode?: SpinalContext);
    execute(pm2ServiceInstance?: Pm2Service): Promise<ActionResponse[]>;
    removeFromGraph(): Promise<boolean>;
    isAvailable(): boolean;
    isNotExpired(): boolean;
}
export { SpinalCommand };
export default SpinalCommand;

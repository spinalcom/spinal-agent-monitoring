import { Model } from "spinal-core-connectorjs";
import { SpinalCommandAction } from "../../utils/constants";
import { ActionResponse } from "../../interfaces/IResponses";
import type { SpinalContext } from "spinal-model-graph";
declare class SpinalCommand extends Model {
    constructor(type?: SpinalCommandAction, processesIds?: string | number | (string | number)[], vmNode?: SpinalContext);
    execute(): Promise<ActionResponse[]>;
    removeFromGraph(): Promise<boolean>;
    isAvailable(): boolean;
    isNotExpired(): boolean;
}
export { SpinalCommand };
export default SpinalCommand;

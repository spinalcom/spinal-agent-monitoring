import { Model } from "spinal-core-connectorjs";
import { SPINAL_COMMAND_TYPE } from "../utils/constants";
import { ActionResponse } from "../interfaces/IResponses";
declare class SpinalCommand extends Model {
    constructor(type?: (typeof SPINAL_COMMAND_TYPE)[keyof typeof SPINAL_COMMAND_TYPE], processesIds?: string | number | (string | number)[]);
    execute(): Promise<ActionResponse>;
}
export { SpinalCommand };
export default SpinalCommand;

import { ProcessDescription } from "pm2";
import { Model } from "spinal-core-connectorjs";
declare class Pm2Process extends Model {
    constructor(_process?: ProcessDescription);
    refreshMetrics(): Promise<void>;
    restart(): void;
    stop(): void;
    start(): void;
}
export default Pm2Process;
export { Pm2Process };

import { ProcessDescription } from "pm2";
import { Model } from "spinal-core-connectorjs";
declare class SpinalPm2Process extends Model {
    constructor(_process?: ProcessDescription);
    refreshMetrics(): Promise<void>;
    updateProcessInfo(_processNewInfo: ProcessDescription): void;
    restart(): void;
    stop(): void;
    start(): void;
    syncLogFile(newData: Buffer): Promise<boolean>;
    private _initLogPathInHub;
}
export default SpinalPm2Process;
export { SpinalPm2Process };

import { ProcessDescription } from "pm2";
import { Model } from "spinal-core-connectorjs";
declare class Pm2Process extends Model {
    constructor(_process?: ProcessDescription);
    refreshMetrics(): Promise<void>;
    updateProcessInfo(_processNewInfo: ProcessDescription): void;
    restart(): void;
    stop(): void;
    start(): void;
    syncLogFile(newData: Buffer): Promise<boolean>;
    private _initLogPathInHub;
}
export default Pm2Process;
export { Pm2Process };

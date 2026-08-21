import pm2 from "pm2";
import { ActionResponse } from "../interfaces/IResponses";
import { SpinalNode } from "spinal-model-graph";
import { IPm2EventData } from "../interfaces";
declare class Pm2Service {
    private static _instance;
    private _isConnected;
    pm2Maps: Map<string | number, SpinalNode>;
    private _context;
    private intervalHandle;
    private _logSyncked;
    private constructor();
    static getInstance(): Pm2Service;
    listentPm2Actions(callback: (data: IPm2EventData) => void): Promise<void>;
    startPeriodicPm2MetricsPush(interval?: number | string): Promise<void>;
    getAllPm2Processes(): Promise<pm2.ProcessDescription[]>;
    getPm2ProcessByKey(key: string): Promise<pm2.ProcessDescription | null>;
    startPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    stopPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    restartPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    private listenPm2Events;
    getPm2MetricsFormatted(): Promise<{
        name: string | undefined;
        pm_id: number | undefined;
        status: string | undefined;
        cpu: number | undefined;
        memory: number | undefined;
        uptime: number | undefined;
    }[]>;
    private _connectToPm2;
    private _listPm2Processes;
    private _disconnectFromPm2;
    private _savePm2Event;
}
export { Pm2Service };
export default Pm2Service;

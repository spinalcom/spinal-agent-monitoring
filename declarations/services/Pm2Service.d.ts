import pm2 from "pm2";
import { ActionResponse } from "../interfaces/IResponses";
declare class Pm2Service {
    private static _instance;
    private _isConnected;
    private constructor();
    static getInstance(): Pm2Service;
    initializePm2Service(callback: (data: any) => void): Promise<void>;
    getAllPm2Processes(): Promise<pm2.ProcessDescription[]>;
    getPm2ProcessByKey(key: string): Promise<pm2.ProcessDescription | null>;
    startPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    stopPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    restartPm2Process(processKeys: string | number | (string | number)[]): Promise<ActionResponse[]>;
    listenPm2Events(callback: (data: any) => void): Promise<void>;
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
}
export { Pm2Service };
export default Pm2Service;

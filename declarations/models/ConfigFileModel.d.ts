import { Lst, Model } from "spinal-core-connectorjs";
import { ISystemMetrics } from "../interfaces/interfaces";
import { ProcessDescription } from "pm2";
import Pm2Process from "./Pm2Process";
import { SpinalCommand } from "./SpinalCommand";
import { SpinalGraph } from "spinal-model-graph";
export default class ConfigFileModel extends Model {
    static FILE_TYPE: string;
    pm2List: Pm2Process[];
    private _graph;
    constructor(name?: string, type?: string, serverName?: string, systemInfo?: ISystemMetrics);
    setGraph(graph: SpinalGraph): void;
    initialize(name?: string, type?: string, serverName?: string, systemInfo?: ISystemMetrics): void;
    updateMetrics(systemInfo: ISystemMetrics): void;
    updatePm2Metrics(): Promise<void>;
    updatePm2Processes(processes: ProcessDescription[]): Promise<Lst<Pm2Process>>;
    getPm2Processes(): Promise<Lst<Pm2Process>>;
    getPm2ProcessById(key: string | number): Promise<Pm2Process | undefined>;
    addCommand(command: SpinalCommand): Promise<void>;
    bindCommandList(): void;
    private _getDefaultHostInfoData;
    private _executeCommand;
    private _syncPm2Process;
    private _checkAttributesExistence;
}
export { ConfigFileModel };

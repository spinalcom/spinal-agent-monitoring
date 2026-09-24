import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { IPm2EventData, ISystemMetrics } from "../../interfaces";
import { ProcessDescription } from "pm2";
export declare class GraphService {
    private static _instance;
    private _graph;
    private _logSyncked;
    pm2Maps: Map<string | number, SpinalNode>;
    private constructor();
    static getInstance(): GraphService;
    setGraph(graph: SpinalGraph): void;
    getGraph(): SpinalGraph | null;
    registerVirtualMachine(hostName: string, data?: {
        systemMetrics?: ISystemMetrics;
        pm2List?: ProcessDescription[];
    }): Promise<SpinalContext>;
    getVirtualMachine(): Promise<SpinalContext | null>;
    updateOrCreateSystemMetrics(vmNode: SpinalContext, systemMetrics: ISystemMetrics, isInit?: boolean): Promise<SpinalNode<any>[]>;
    getPm2ProcessesNodesAsObj(context: SpinalContext): Promise<{
        [key: string]: SpinalNode;
    }>;
    getPm2ProcessesNodes(vmNode: SpinalContext): Promise<SpinalNode[]>;
    updateOrCreatePm2Process(vmNode: SpinalContext, pm2Process: ProcessDescription[]): Promise<SpinalNode[]>;
    getPm2ProcessNodeByKey(vmNode: SpinalContext, key: string | number): Promise<SpinalNode | undefined>;
    handlePm2Event(vmNode: SpinalContext, event: IPm2EventData): Promise<SpinalNode<any> | SpinalNode<any>[]>;
    updatePm2ProcessesMetrics(vmNode: SpinalContext, pm2Processes: ProcessDescription | ProcessDescription[], existingNodes?: {
        [key: string]: SpinalNode;
    }, isInit?: boolean): Promise<void[]>;
    initializeOrRetrievePm2Logs(processNode: SpinalNode, logType?: "out" | "err"): Promise<{
        node: SpinalNode;
        path: string;
        model: any;
    } | null>;
    removePm2ProcessFromGraph(vmNode: SpinalContext, processNode: SpinalNode | string): Promise<void>;
    createOrRetrieveVmContext(graph: SpinalGraph, hostName: string): Promise<SpinalContext>;
    private _syncPm2Processes;
    private _addPm2ProcessToGraph;
    private _addLogRelationToPm2Process;
    private _buildPm2ProcessNodeInfo;
    private _updateOrganConfigData;
}
export default GraphService;

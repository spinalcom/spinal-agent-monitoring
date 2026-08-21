import { SpinalNode } from "spinal-model-graph";
import { InputDataEndpoint } from "spinal-model-bmsnetwork";
import { ISystemMetrics } from "../interfaces";
export declare class EndpointUtils {
    private static instance;
    private constructor();
    static getInstance(): EndpointUtils;
    getEndpointByName(parentNode: SpinalNode, endpointName: string): Promise<SpinalNode | null>;
    getEndpointsTimeSeries(endpointNode: SpinalNode, startTime: number, endTime: number): Promise<import("spinal-model-bmsnetwork").SpinalDateValue[]>;
    createOrUpdateEndpoints(parentNode: SpinalNode, endpointsData: InputDataEndpoint[]): Promise<SpinalNode<any>[]>;
    updateOrCreateMetricsEndpoints(parentNode: SpinalNode, metricsData: ISystemMetrics): Promise<(void | SpinalNode<any>)[]>;
    updateOrCreatePm2ProcessEndpoints(pm2Node: SpinalNode): Promise<void>;
    private _updateOrCreateRamEndpoint;
    private _updateOrCreateCPUEndpoint;
    private _updateOrCreateHeapMemoryEndpoints;
    _updateRebootEndpoint(pm2Node: SpinalNode, value: number): Promise<void | SpinalNode<any>>;
    _updateErroredEndpoint(pm2Node: SpinalNode, erroredCount: number): Promise<void | SpinalNode<any>>;
    private _formatEndpointData;
}
export default EndpointUtils;

import { SpinalNode } from "spinal-model-graph";
import { ISystemMetrics } from "../../interfaces";
export declare class EndpointService {
    private static instance;
    private constructor();
    static getInstance(): EndpointService;
    getEndpointByName(parentNode: SpinalNode, endpointName: string): Promise<SpinalNode | null>;
    getEndpointsTimeSeries(endpointNode: SpinalNode, startTime: number, endTime: number): Promise<import("spinal-model-bmsnetwork").SpinalDateValue[]>;
    updateEndpointMaxDay(endpointNode: SpinalNode, maxDay: string | number): Promise<false | undefined>;
    updateOrCreateMetricsEndpoints(parentNode: SpinalNode, metricsData: ISystemMetrics, isInit?: boolean): Promise<SpinalNode[]>;
    updateOrCreatePm2ProcessEndpoints(pm2Node: SpinalNode, isInit?: boolean): Promise<void>;
    private _updateOrCreateRamEndpoint;
    private _updateOrCreateCPUEndpoint;
    private _updateOrCreateHeapMemoryEndpoints;
    _updateRebootEndpoint(pm2Node: SpinalNode, value: number, existingEndpoints?: SpinalNode[], isInit?: boolean): Promise<SpinalNode<any>>;
    _updateErroredEndpoint(pm2Node: SpinalNode, erroredCount: number, existingEndpoints?: SpinalNode[], isInit?: boolean): Promise<SpinalNode<any>>;
    private _toNumber;
    private _getTimeseriesMaxDay;
    private _updateMaxDayIfInit;
}
export default EndpointService;

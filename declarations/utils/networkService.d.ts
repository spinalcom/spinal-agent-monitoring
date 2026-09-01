import { InputDataEndpoint, SpinalBmsEndpoint, SpinalServiceTimeseries } from "spinal-model-bmsnetwork";
import { SpinalNode } from "spinal-model-graph";
export declare const spinalServiceTimeseries: SpinalServiceTimeseries;
export declare function createNewBmsEndpoint(parentNode: SpinalNode, endpoint: InputDataEndpoint): Promise<SpinalNode>;
export declare function createAttribute(endpointNode: SpinalNode, element: SpinalBmsEndpoint): Promise<any>;
export declare function updateEndpoint(endpointNode: SpinalNode, newValue: string | number | boolean): Promise<SpinalNode>;
export declare function updateEndpointMaxDay(endpointNode: SpinalNode, maxDay?: string | number): Promise<false | undefined>;
export declare function updateOrCreateEndpoint(parentNode: SpinalNode, endpointData: InputDataEndpoint, value: {
    value: number;
    min?: number;
    max?: number;
}, existingEndpoints?: SpinalNode[]): Promise<SpinalNode<any>>;

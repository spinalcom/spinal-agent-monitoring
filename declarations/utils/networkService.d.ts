import { InputDataEndpoint, SpinalBmsEndpoint, SpinalServiceTimeseries } from "spinal-model-bmsnetwork";
import { SpinalNode } from "spinal-model-graph";
export declare const spinalServiceTimeseries: SpinalServiceTimeseries;
export declare function createNewBmsEndpoint(parentNode: SpinalNode, endpoint: InputDataEndpoint): Promise<SpinalNode>;
export declare function createAttribute(endpointNode: SpinalNode, element: SpinalBmsEndpoint): Promise<any>;
export declare function updateEndpoint(endpointNode: SpinalNode, newValue: string | number | boolean): Promise<void>;

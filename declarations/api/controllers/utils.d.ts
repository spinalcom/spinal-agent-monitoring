import { SpinalContext, SpinalNode } from "spinal-model-graph";
import { IVMResponse } from "../../interfaces/IVMResponse";
import { IPm2Response } from "../../interfaces";
import { Pm2ProcessMetricsResponse, Pm2ProcessResponse } from "../../interfaces/IResponses";
export declare function _formatVmNode(vmNode: SpinalContext): IVMResponse;
export declare function _formatPm2Process(pm2Process: SpinalNode): Pm2ProcessResponse;
export declare function _formatPm2ProcessMetrics(pm2Process: SpinalNode): Pm2ProcessMetricsResponse;
export declare function _getBosData(info: IPm2Response): Record<string, any>;
export declare function getBosNameFromPath(path: string): string;

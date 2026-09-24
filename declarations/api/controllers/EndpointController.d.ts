import { Controller } from "tsoa";
import { ActionResponse, ErrorResponse } from "../../interfaces/IResponses";
type EndpointValueResponse = {
    id: string;
    name: string;
    currentValue: string | number | boolean | null;
    unit: string | null;
};
type EndpointTimeSeriesResponse = {
    id: string;
    name: string;
    values: Array<{
        date: number;
        value: number | boolean;
    }>;
};
type UpdateMaxDayBody = {
    maxDay: number | string;
};
export declare class EndpointController extends Controller {
    private readonly endpointUtils;
    private readonly VMGraphServiceInstance;
    getPm2RamHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2RamHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2CpuHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2CpuHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapSizeHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapSizeHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapUsageHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapUsageHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapUsedSizeHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapUsedSizeHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2RebootHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2RebootHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2ErroredHistoryValue(vmKey: string, pm2Key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2ErroredHistoryTimeseries(vmKey: string, pm2Key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    updatePm2EndpointMaxDay(vmKey: string, pm2Key: string, endpoint: string, body: UpdateMaxDayBody): Promise<ActionResponse | ErrorResponse>;
    getVmCpuUsageValue(vmKey: string): Promise<EndpointValueResponse | ErrorResponse>;
    getVmCpuUsageTimeseries(vmKey: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getVmRamUsageValue(vmKey: string): Promise<EndpointValueResponse | ErrorResponse>;
    getVmRamUsageTimeseries(vmKey: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getVmDiskUsageValue(vmKey: string): Promise<EndpointValueResponse | ErrorResponse>;
    getVmDiskUsageTimeseries(vmKey: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    updateVmEndpointMaxDay(vmKey: string, endpoint: string, body: UpdateMaxDayBody): Promise<ActionResponse | ErrorResponse>;
    private getPm2EndpointValueByName;
    private getPm2EndpointTimeSeriesByName;
    private getVmEndpointValueByName;
    private getVmEndpointTimeSeriesByName;
    private getPm2NodeFromKey;
    private getVmContextFromKey;
    private resolvePm2EndpointName;
    private resolveVmEndpointName;
}
export {};

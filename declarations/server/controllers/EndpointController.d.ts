import { Controller } from "tsoa";
import { ErrorResponse } from "../../interfaces/IResponses";
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
export declare class EndpointController extends Controller {
    private readonly endpointUtils;
    private readonly spinalGraphService;
    getPm2RamHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2RamHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2CpuHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2CpuHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapSizeHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapSizeHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapUsageHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapUsageHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2HeapUsedSizeHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2HeapUsedSizeHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2RebootHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2RebootHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getPm2ErroredHistoryValue(key: string): Promise<EndpointValueResponse | ErrorResponse>;
    getPm2ErroredHistoryTimeseries(key: string, startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getVmCpuUsageValue(): Promise<EndpointValueResponse | ErrorResponse>;
    getVmCpuUsageTimeseries(startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getVmRamUsageValue(): Promise<EndpointValueResponse | ErrorResponse>;
    getVmRamUsageTimeseries(startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    getVmDiskUsageValue(): Promise<EndpointValueResponse | ErrorResponse>;
    getVmDiskUsageTimeseries(startTime?: number, endTime?: number): Promise<EndpointTimeSeriesResponse | ErrorResponse>;
    private getPm2EndpointValueByName;
    private getPm2EndpointTimeSeriesByName;
    private getVmEndpointValueByName;
    private getVmEndpointTimeSeriesByName;
    private getPm2NodeFromKey;
}
export {};

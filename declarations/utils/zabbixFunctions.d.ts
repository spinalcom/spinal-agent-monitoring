import { ProcessDescription } from "pm2";
import SystemOverviewService from "../services/SystemOverviewService";
import { Pm2Discovery, ZabbixMetric } from "../services/ZabbixSenderService";
export declare function _generateZabbixMetrics(systemMetrics: ReturnType<SystemOverviewService["getSystemMetrics"]>, pm2Processes: ProcessDescription[], discovery: Pm2Discovery): ZabbixMetric[];

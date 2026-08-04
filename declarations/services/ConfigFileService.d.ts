import config from "../utils/config";
import { FileSystem, Lst } from "spinal-core-connectorjs";
import ConfigFileModel from "../models/ConfigFileModel";
import { ISystemMetrics } from "../interfaces/interfaces";
import { Pm2Process } from "../models/Pm2Process";
export default class ConfigFileService {
    private static _instance;
    readonly agentInfo: typeof config.monitoringApiConfig;
    private configFileModel;
    private pm2_processes;
    private constructor();
    static getInstance(): ConfigFileService;
    initializeConfigFile(spinalConnection: FileSystem, systemInfo: ISystemMetrics): Promise<ConfigFileModel>;
    updatePm2List(): Promise<Lst<Pm2Process> | undefined>;
    refreshSystemMetrics(systemInfo: ISystemMetrics): void;
    refreshPm2Metrics(): Promise<void>;
    private _loadOrMakeConfigFile;
    private _errorCallback;
}
export { ConfigFileService };

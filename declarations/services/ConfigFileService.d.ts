import { FileSystem } from "spinal-core-connectorjs";
import { SpinalGraph } from "spinal-model-graph";
export default class ConfigFileService {
    private static _instance;
    private configFileModel;
    private pm2_processes;
    private _graph;
    private constructor();
    static getInstance(): ConfigFileService;
    initializeConfigFile(spinalConnection: FileSystem, organName?: string): Promise<SpinalGraph>;
    private _loadOrMakeConfigFile;
    private _errorCallback;
}
export { ConfigFileService };

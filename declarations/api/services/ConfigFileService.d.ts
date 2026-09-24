import { FileSystem } from "spinal-core-connectorjs";
import { SpinalGraph } from "spinal-model-graph";
export default class ConfigFileService {
    private static _instance;
    private _graph;
    private readonly DEFAULT_CONFIG_FILE_PATH;
    private constructor();
    static getInstance(): ConfigFileService;
    initializeConfigFile(spinalConnection: FileSystem, configFilePath?: string): Promise<SpinalGraph>;
    private _loadOrMakeConfigFile;
    private _errorCallback;
}
export { ConfigFileService };

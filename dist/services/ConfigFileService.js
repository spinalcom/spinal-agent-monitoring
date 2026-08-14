"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileService = void 0;
const os_1 = __importDefault(require("os"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
class ConfigFileService {
    constructor() {
        this.configFileModel = null;
        this._graph = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ConfigFileService();
        }
        return this._instance;
    }
    async initializeConfigFile(spinalConnection, organName) {
        organName = organName || os_1.default.hostname();
        // const configFileName = `VM_MONITORING_${organName}`;
        const configFileName = `${organName}`;
        const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
        this._graph = await this._loadOrMakeConfigFile(spinalConnection, configFilePath);
        return this._graph;
        // await configFile.initialize(organName, "Monitoring", os.hostname(), systemInfo);
        // this.configFileModel = configFile;
        // // Refresh PM2 processes after initializing the config file
        // await this.updatePm2List();
        // // Bind the command list to listen for new commands
        // configFile.bindCommandList();
        // return this.configFileModel;
    }
    // public async updatePm2List() {
    // 	const processes = await Pm2Service.getInstance().getAllPm2Processes();
    // 	this.pm2_processes = await this.configFileModel?.updatePm2Processes(processes);
    // 	return this.pm2_processes;
    // }
    // public refreshSystemMetrics(systemInfo: ISystemMetrics) {
    // 	if (this.configFileModel) this.configFileModel.updateMetrics(systemInfo);
    // }
    // public async refreshPm2Metrics() {
    // 	if (this.configFileModel) await this.configFileModel.updatePm2Metrics();
    // }
    _loadOrMakeConfigFile(spinalConnection, filePath) {
        return new Promise((resolve, reject) => {
            spinal_core_connectorjs_1.spinalCore.load(spinalConnection, filePath, (graph) => resolve(graph), // Success callback
            () => this._errorCallback(spinalConnection, filePath, resolve, reject));
        });
    }
    _errorCallback(connection, filePath, resolve, reject) {
        try {
            const graph = new spinal_model_graph_1.SpinalGraph();
            spinal_core_connectorjs_1.spinalCore.store(connection, graph, filePath, () => resolve(graph), () => reject(new Error(`Failed to create or load the config file at ${filePath}`)));
            // const directory = path.dirname(filePath);
            // const fileName = path.basename(filePath);
            // connection.load_or_make_dir(directory, (dir: Directory) => {
            // 	const file = new ConfigFileModel(organName, organType, os.hostname(), systemInfo);
            // 	dir.force_add_file(fileName, file, { model_type: "ConfigFile" });
            // 	resolve(file);
            // });
        }
        catch (error) {
            reject(error);
        }
    }
}
exports.default = ConfigFileService;
exports.ConfigFileService = ConfigFileService;
//# sourceMappingURL=ConfigFileService.js.map
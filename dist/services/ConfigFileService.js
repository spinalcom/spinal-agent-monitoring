"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileService = void 0;
const os_1 = __importDefault(require("os"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../utils");
class ConfigFileService {
    constructor() {
        this.configFileModel = null;
        this._graph = null;
        this.commandExecuted = new Set();
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
        await this.initAndBindCommandList();
        return this._graph;
    }
    async initAndBindCommandList() {
        const commandList = this._initCommandList(this._graph);
        commandList.bind(async () => {
            for (let i = 0; i < commandList.length; i++) {
                const command = commandList[i];
                await this._executeCommand(command).finally(() => {
                    this.commandExecuted.add(command.id.get());
                    commandList.remove(command);
                });
            }
        });
    }
    _initCommandList(graph) {
        if (!graph)
            throw new Error("Graph is not initialized. Please call initializeConfigFile first.");
        if (typeof graph.info?.commandList === "undefined") {
            graph.info.add_attr({ commandList: new spinal_core_connectorjs_1.Lst([]) });
        }
        return graph.info.commandList;
    }
    _executeCommand(command) {
        // Check if the command is available before executing
        if (!command.isAvailable())
            return Promise.resolve(false);
        // Check if the command has already been executed to avoid duplicate execution
        if (this.commandExecuted.has(command.id.get()))
            return Promise.resolve(false);
        return command
            .execute()
            .then(() => {
            command.status.set(utils_1.SPINAL_COMMAND_STATUS.completed);
            return true;
        })
            .catch((error) => {
            command.status.set(utils_1.SPINAL_COMMAND_STATUS.failed);
            return false;
        });
    }
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
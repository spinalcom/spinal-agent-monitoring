"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileService = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../utils");
class ConfigFileService {
    constructor() {
        this._graph = null;
        this.commandExecuted = new Set();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ConfigFileService();
        }
        return this._instance;
    }
    // public async initializeConfigFile(spinalConnection: FileSystem, organName?: string): Promise<SpinalGraph> {
    async initializeConfigFile(spinalConnection) {
        // organName = organName || os.hostname();
        // const configFileName = `${organName}`;
        const configFileName = `Monitoring config file`;
        const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
        const graph = await this._loadOrMakeConfigFile(spinalConnection, configFilePath);
        // await this.initAndBindCommandList();
        return graph;
    }
    _loadOrMakeConfigFile(spinalConnection, filePath) {
        return new Promise((resolve, reject) => {
            spinal_core_connectorjs_1.spinalCore.load(spinalConnection, filePath, async (graph) => {
                resolve(graph);
            }, // Success callback
            () => this._errorCallback(spinalConnection, filePath, resolve, reject));
        });
    }
    _errorCallback(connection, filePath, resolve, reject) {
        try {
            const graph = new spinal_model_graph_1.SpinalGraph();
            spinal_core_connectorjs_1.spinalCore.store(connection, graph, filePath, async () => {
                await (0, utils_1.waitUntil)(() => typeof graph._server_id !== "undefined", 500);
                resolve(graph);
            }, () => reject(new Error(`Failed to create or load the config file at ${filePath}`)));
        }
        catch (error) {
            reject(error);
        }
    }
}
exports.default = ConfigFileService;
exports.ConfigFileService = ConfigFileService;
//# sourceMappingURL=ConfigFileService.js.map
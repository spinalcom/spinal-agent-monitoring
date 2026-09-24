"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalhubService = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const ConfigFileService_1 = __importDefault(require("./ConfigFileService"));
class SpinalhubService {
    constructor() {
        this.conn = null;
        this._graph = null;
        spinal_core_connectorjs_1.FileSystem.onConnectionError = (code_error) => {
            console.error("Spinalhub connection error:", code_error);
        };
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new SpinalhubService();
        }
        return this._instance;
    }
    setConnection(conn) {
        this.conn = conn;
    }
    getConnection() {
        return this.conn;
    }
    getGraph() {
        if (!this._graph) {
            throw new Error("Monitoring Graph is not initialized.");
        }
        return this._graph;
    }
    async initializeConfigFile(configFilePath = "/etc/Organs/Monitoring/DEFAULT_VM_MONITORING_CONFIG") {
        if (!this.conn) {
            throw new Error("No connection to Spinalhub. Please set the connection first.");
        }
        const graph = await ConfigFileService_1.default.getInstance().initializeConfigFile(this.conn, configFilePath);
        this._graph = graph;
        return graph;
    }
}
exports.default = SpinalhubService;
exports.SpinalhubService = SpinalhubService;
//# sourceMappingURL=SpinalhubService.js.map
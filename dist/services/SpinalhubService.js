"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalhubService = void 0;
const config_1 = __importDefault(require("../utils/config"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
class SpinalhubService {
    constructor() {
        this.spinalConnectorInfo = config_1.default.spinalConnector;
        this.conn = null;
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
    connect() {
        return this.connectToSpinalhub();
    }
    getConnectString() {
        const { protocol, user, password, host, port } = this.spinalConnectorInfo;
        if (!protocol || !user || !password || !host) {
            return null;
        }
        let connect_opt = `${protocol}://${user}:${password}@${host}`;
        if (port)
            connect_opt += `:${port}`;
        return connect_opt;
    }
    getConnection() {
        return this.conn;
    }
    connectToSpinalhub() {
        let connect_opt = this.getConnectString();
        if (!connect_opt) {
            throw new Error("Missing configuration for Spinalhub connection. Please check your environment variables.");
        }
        this.conn = spinal_core_connectorjs_1.spinalCore.connect(connect_opt);
        return this.conn;
    }
}
exports.default = SpinalhubService;
exports.SpinalhubService = SpinalhubService;
//# sourceMappingURL=SpinalhubService.js.map
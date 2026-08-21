"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalhubService = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
class SpinalhubService {
    constructor() {
        this.spinalConnectorInfo = {
            protocol: process.env.SPINALHUB_PROTOCOL, // user id
            user: process.env.SPINAL_USER_ID, // user id
            password: process.env.SPINAL_PASSWORD, // user password
            host: process.env.SPINALHUB_IP, // can be an ip address
            port: process.env.SPINALHUB_PORT,
        };
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
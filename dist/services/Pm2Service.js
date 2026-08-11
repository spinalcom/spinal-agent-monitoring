"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pm2Service = void 0;
const pm2_1 = __importDefault(require("pm2"));
const pm2Utils_1 = require("../utils/pm2Utils");
const lodash = __importStar(require("lodash"));
class Pm2Service {
    constructor() {
        this._isConnected = false;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Pm2Service();
        }
        return this._instance;
    }
    async initializePm2Service(callback) {
        this.listenPm2Events(callback);
    }
    async getAllPm2Processes() {
        try {
            await this._connectToPm2();
            const processes = await this._listPm2Processes();
            return processes;
        }
        catch (error) {
            return [];
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async getPm2ProcessByKey(key) {
        try {
            await this._connectToPm2();
            const processes = await this._listPm2Processes();
            const process = processes.find((p) => p.name == key || p.pm_id?.toString() == key);
            return process || null;
        }
        catch (error) {
            return null;
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async startPm2Process(processKeys) {
        const keys = Array.isArray(processKeys) ? processKeys : [processKeys];
        try {
            await this._connectToPm2();
            const promises = keys.map((key) => (0, pm2Utils_1.executeCommand)("start", key));
            const result = await Promise.all(promises);
            return result.map((res, index) => ({
                key: keys[index],
                success: res,
                message: res ? "Process started successfully" : "Failed to start process",
            }));
        }
        catch (error) {
            return keys.map((key) => ({
                key,
                success: false,
                message: "Failed to start process",
            }));
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async stopPm2Process(processKeys) {
        const keys = Array.isArray(processKeys) ? processKeys : [processKeys];
        try {
            await this._connectToPm2();
            const promises = keys.map((key) => (0, pm2Utils_1.executeCommand)("stop", key));
            const result = await Promise.all(promises);
            return result.map((res, index) => ({
                key: keys[index],
                success: res,
                message: res ? "Process stopped successfully" : "Failed to stop process",
            }));
        }
        catch (error) {
            return keys.map((key) => ({
                key,
                success: false,
                message: "Failed to stop process",
            }));
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async restartPm2Process(processKeys) {
        const keys = Array.isArray(processKeys) ? processKeys : [processKeys];
        try {
            await this._connectToPm2();
            const promises = keys.map((key) => (0, pm2Utils_1.executeCommand)("restart", key));
            const result = await Promise.all(promises);
            return result.map((res, index) => ({
                key: keys[index],
                success: res,
                message: res ? "Process restarted successfully" : "Failed to restart process",
            }));
        }
        catch (error) {
            return keys.map((key) => ({
                key,
                success: false,
                message: "Failed to restart process",
            }));
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async listenPm2Events(callback) {
        await this._connectToPm2();
        const callBackWithDebounce = lodash.debounce(callback, 1000);
        pm2_1.default.launchBus((err, bus) => {
            if (err)
                throw err;
            bus.on("process:event", (data) => {
                callBackWithDebounce(data);
            });
        });
    }
    async getPm2MetricsFormatted() {
        const processes = await this.getAllPm2Processes();
        const formattedProcesses = processes.map((process) => {
            const formatted = (0, pm2Utils_1.formatProcess)(process);
            return {
                name: formatted.name,
                pm_id: formatted.pm_id,
                status: formatted.status,
                cpu: formatted.cpu,
                memory: formatted.memory,
                uptime: formatted.uptime,
            };
        });
        return formattedProcesses;
    }
    ////////////////////////////////////////////////////////////
    _connectToPm2() {
        return new Promise((resolve, reject) => {
            if (this._isConnected)
                return resolve();
            pm2_1.default.connect((err) => {
                if (err) {
                    this._isConnected = false;
                    reject(err);
                }
                else {
                    this._isConnected = true;
                    resolve();
                }
            });
        });
    }
    _listPm2Processes() {
        return new Promise((resolve, reject) => {
            pm2_1.default.list((err, processDescriptionList) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(processDescriptionList);
                }
            });
        });
    }
    _disconnectFromPm2() {
        pm2_1.default.disconnect();
    }
}
exports.Pm2Service = Pm2Service;
exports.default = Pm2Service;
//# sourceMappingURL=Pm2Service.js.map
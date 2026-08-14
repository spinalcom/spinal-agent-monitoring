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
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../utils");
const fs = __importStar(require("fs"));
class Pm2Service {
    constructor() {
        this._isConnected = false;
        this.pm2Maps = new Map();
        this._context = null;
        this.intervalHandle = null;
        this._logSyncked = new Map();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Pm2Service();
        }
        return this._instance;
    }
    async initialize(graph) {
        this._context = await this._createOrGetPm2Context(graph);
        await this._initializePm2Processes(this._context);
        await this.updatePm2Processes();
        await this._watchAndSyncLogs();
    }
    async listentPm2Actions(callback) {
        this.listenPm2Events(callback);
    }
    async updatePm2Processes() {
        if (!this._context) {
            console.log("Pm2Service: Context is not initialized. Cannot update PM2 processes.");
            return;
        }
        const pm2Processes = await this.getAllPm2Processes();
        for (const pm2Process of pm2Processes) {
            const processNode = this.pm2Maps.get(pm2Process.name) || this.pm2Maps.get(pm2Process.pm_id);
            if (!processNode || processNode.getName().get() !== pm2Process.name) {
                if (processNode)
                    await this.removePm2ProcessFromGraph(processNode);
                await this.addPm2ProcessToGraph(pm2Process);
                continue;
            }
            this.updatePm2ProcessesMetrics(processNode, pm2Process);
        }
    }
    async startPeriodicPm2MetricsPush(interval = 15000) {
        if (this.intervalHandle)
            return;
        this.intervalHandle = setInterval(async () => {
            const processes = await this.getAllPm2Processes();
            for (const pm2Process of processes) {
                const processNode = this.pm2Maps.get(pm2Process.name) || this.pm2Maps.get(pm2Process.pm_id);
                if (processNode)
                    this.updatePm2ProcessesMetrics(processNode, pm2Process);
            }
            console.log(`[${new Date().toISOString()}] - PM2 processes metrics updated and pushed to SpinalGraph.`);
        }, parseInt(interval.toString()));
    }
    removePm2ProcessFromGraph(processNode) {
        return processNode.removeFromGraph().then(async () => {
            const name = processNode.getName().get();
            const pm_id = processNode.info?.pm_id?.get();
            if (name)
                this.pm2Maps.delete(name);
            if (pm_id)
                this.pm2Maps.delete(pm_id);
            await processNode.removeRelation(utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
                const pathWatched = this._logSyncked.get(processNode._server_id);
                // If the log file was being watched, unwatch it and remove from the map
                if (pathWatched) {
                    fs.unwatchFile(pathWatched);
                    this._logSyncked.delete(processNode._server_id);
                }
                return result;
            });
        });
    }
    updatePm2ProcessesMetrics(processNode, pm2Process) {
        const pm2Env = pm2Process.pm2_env;
        processNode.info.status.set(pm2Env?.status);
        processNode.info.restarts.set(pm2Env?.restart_time);
        processNode.info.uptime.set(pm2Env?.pm_uptime);
        const { heapSize, heapUsage, heapUsedSize } = (0, pm2Utils_1.getHeapInfo)(pm2Process);
        processNode.info.heapMemory?.heapSize.set(heapSize);
        processNode.info.heapMemory?.heapUsage.set(heapUsage);
        processNode.info.heapMemory?.heapUsedSize.set(heapUsedSize);
        const { memory, cpu } = pm2Process.monit || {};
        processNode.info.monit?.memory.set(memory);
        processNode.info.monit?.cpu.set(cpu);
    }
    async addPm2ProcessToGraph(pm2Process) {
        if (!this._context)
            return null;
        const existingNode = this.pm2Maps.get(pm2Process.name) || this.pm2Maps.get(pm2Process.pm_id);
        if (existingNode)
            return existingNode;
        const node = new spinal_model_graph_1.SpinalNode(pm2Process.name, utils_1.PM2_PROCESS_NODE_TYPE);
        node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));
        this.pm2Maps.set(pm2Process.name, node);
        if (pm2Process.pm_id)
            this.pm2Maps.set(pm2Process.pm_id, node);
        await this._addLogRelationToPm2Process(node);
        return this._context.addChild(node, utils_1.HAS_PM2_PROCESS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    _buildPm2ProcessNodeInfo(pm2Process) {
        const pm2Env = pm2Process.pm2_env;
        return {
            pm_id: pm2Process.pm_id,
            status: pm2Env?.status,
            restarts: pm2Env?.restart_time,
            uptime: pm2Env?.pm_uptime,
            heapMemory: (0, pm2Utils_1.getHeapInfo)(pm2Process),
            monit: {
                memory: pm2Process.monit?.memory,
                cpu: pm2Process.monit?.cpu,
            },
            cwd: pm2Env?.cwd,
            created_at: pm2Env?.created_at,
            log: {
                out: pm2Env?.pm_out_log_path,
                err: pm2Env?.pm_err_log_path,
            },
            // logPathInHub: this._initLogPathInHub(pm2Process.name as string),
        };
    }
    _addLogRelationToPm2Process(node) {
        const logPath = (0, utils_1._initLogPathInHub)(node.getName().get());
        const logNode = new spinal_model_graph_1.SpinalNode(`${node.getName().get()}_log`, utils_1.PM2_LOG_NODE_TYPE, logPath);
        return node.addChild(logNode, utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    async _createOrGetPm2Context(graph) {
        if (this._context)
            return this._context;
        let existingContext = await graph.getContext(utils_1.PM2_PROCESS_CONTEXT_NAME);
        if (existingContext && existingContext.getType().get() == utils_1.PM2_PROCESS_CONTEXT_TYPE)
            return existingContext;
        const newContext = new spinal_model_graph_1.SpinalContext(utils_1.PM2_PROCESS_CONTEXT_NAME, utils_1.PM2_PROCESS_CONTEXT_TYPE);
        return graph.addContext(newContext);
    }
    async _initializePm2Processes(context) {
        const existingProcesses = await context.getChildren(utils_1.HAS_PM2_PROCESS_RELATION_NAME);
        for (const process of existingProcesses) {
            const name = process.getName().get();
            const pm_id = process.info?.pm_id?.get();
            if (name)
                this.pm2Maps.set(name, process);
            if (pm_id)
                this.pm2Maps.set(pm_id, process);
        }
    }
    async _watchAndSyncLogs() {
        for (const [key, processNode] of this.pm2Maps.entries()) {
            const dynamicId = processNode._server_id;
            if (this._logSyncked.has(dynamicId))
                continue;
            const logPath = await this._syncLogForProcess(processNode);
            if (logPath)
                this._logSyncked.set(dynamicId, logPath);
        }
    }
    async _syncLogForProcess(processNode) {
        return new Promise(async (resolve, reject) => {
            let logPathNode = (await processNode.getChildren(utils_1.HAS_LOG)).find((child) => child.getType().get() === utils_1.PM2_LOG_NODE_TYPE);
            if (!logPathNode)
                logPathNode = await this._addLogRelationToPm2Process(processNode);
            const pathModel = await logPathNode.getElement();
            const logPath = processNode.info?.log?.out?.get();
            if (!logPath || !pathModel)
                return resolve(null);
            const processName = processNode.getName().get();
            const debouncedUpdate = lodash.debounce(async (newData) => {
                const isUploaded = await (0, utils_1.uploadFileNewData)(pathModel, newData);
                const message = isUploaded ? `${processName} Log data uploaded successfully` : `Failed to upload ${processName} log data`;
                console.log(message);
            }, 5000);
            fs.watchFile(logPath, (curr, prev) => {
                const stream = fs.createReadStream(logPath, { encoding: "utf8" });
                stream.on("data", (data) => debouncedUpdate(data));
            });
            resolve(logPath);
        });
    }
    //////////////////////////////////////////////////////////////////////
    //  methods to interact with PM2
    //////////////////////////////////////////////////////////////////////
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
                callback(data);
                // don't use debounce because "pm2 stop all" will trigger multiple events and we want to send all of them to the clients
                // callBackWithDebounce(data);
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
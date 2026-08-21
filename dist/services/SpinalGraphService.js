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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalGraphService = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../utils");
const fs = __importStar(require("fs"));
const lodash = __importStar(require("lodash"));
const EndpointUtils_1 = require("./EndpointUtils");
const endpointUtils = EndpointUtils_1.EndpointUtils.getInstance();
class SpinalGraphService {
    constructor() {
        this._graph = null;
        this.vmContext = null;
        this._logSyncked = new Map();
        this.pm2Maps = new Map();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new SpinalGraphService();
        }
        return this._instance;
    }
    setGraph(graph) {
        this._graph = graph;
    }
    getGraph() {
        return this._graph;
    }
    async setupSystemMetricsAndPm2(agentName, systemMetrics, pm2Instances) {
        if (!this._graph)
            throw new Error("Graph is not initialized. Please set the graph before initializing services.");
        this.vmContext = await this._initVmContext(this._graph, agentName);
        const promises = [this.updateSystemMetrics(systemMetrics), this._initPm2Processes(this.vmContext, pm2Instances)];
        return Promise.all(promises);
    }
    updateSystemMetrics(systemMetrics) {
        if (!this.vmContext)
            throw new Error("VM Context is not initialized. Please initialize the VM context before updating system metrics.");
        for (const [key, value] of Object.entries(systemMetrics)) {
            if (this.vmContext.info[key])
                this.vmContext.info[key].set(value);
            else
                this.vmContext.info.add_attr(key, value);
        }
        return endpointUtils.updateOrCreateMetricsEndpoints(this.vmContext, systemMetrics);
    }
    async treatPm2Event(pm2Process) {
        const processKey = pm2Process.process.pm_id || pm2Process.process.name;
        let processFound = this.pm2Maps.get(processKey);
        if (!processFound)
            processFound = (await this._addPm2ProcessToGraph(pm2Process.process));
        const eventType = pm2Process.event;
        const promises = [];
        const isErrorEvent = ["errored", "error"].includes(eventType);
        if (isErrorEvent)
            promises.push(endpointUtils._updateErroredEndpoint(processFound, 1));
        const value = ["stop", "exit", "errored", "error"].includes(eventType) ? 0 : 1;
        promises.push(endpointUtils._updateRebootEndpoint(processFound, value));
        return Promise.all(promises);
    }
    async syncPm2Processes(pm2Processes) {
        if (!this.vmContext)
            throw new Error("VM Context is not initialized. Please initialize the VM context before updating PM2 processes.");
        const nodes = [];
        for (const pm2Process of pm2Processes) {
            let processAlreadyExist = this.pm2Maps.get(pm2Process.pm_id) || this.pm2Maps.get(pm2Process.name) || null;
            if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
                if (processAlreadyExist)
                    await this.removePm2ProcessFromGraph(processAlreadyExist);
                // Add the new process to the graph and update the map
                processAlreadyExist = await this._addPm2ProcessToGraph(pm2Process);
                const key = pm2Process.pm_id || pm2Process.name;
                if (processAlreadyExist && key)
                    this.pm2Maps.set(key, processAlreadyExist);
            }
            if (processAlreadyExist)
                nodes.push(processAlreadyExist);
        }
        const promises = nodes.map(async (node) => endpointUtils.updateOrCreatePm2ProcessEndpoints(node));
        return Promise.all(promises);
    }
    updatePm2ProcessesMetrics(pm2Processes) {
        if (!Array.isArray(pm2Processes))
            pm2Processes = [pm2Processes];
        const promises = [];
        for (const pm2Process of pm2Processes) {
            const processNode = this.pm2Maps.get(pm2Process.pm_id) || this.pm2Maps.get(pm2Process.name);
            if (!processNode)
                continue;
            // const { heapData, memory, cpu } = this._updateInfo(processNode, pm2Process);
            promises.push(endpointUtils.updateOrCreatePm2ProcessEndpoints(processNode));
        }
        return Promise.all(promises);
    }
    //////////////////////////////////////////////////
    // Private methods
    //////////////////////////////////////////////////
    _updateInfo(processNode, pm2Process) {
        const pm2Env = pm2Process.pm2_env;
        processNode.info.restarts.set(pm2Env?.restart_time); // Update the restart count
        processNode.info.uptime.set(pm2Env?.pm_uptime); // Update the uptime
        processNode.info.status.set(pm2Env?.status); // Update the status
        const heapData = (0, utils_1.getHeapInfo)(pm2Process);
        processNode.info.heapMemory?.heapSize.set(heapData.heapSize); // Update the heap size
        processNode.info.heapMemory?.heapUsage.set(heapData.heapUsage); // Update the heap usage
        processNode.info.heapMemory?.heapUsedSize.set(heapData.heapUsedSize); // Update the heap used size
        const { memory, cpu } = pm2Process.monit || {};
        processNode.info.monit?.memory.set(memory); // Update the memory usage
        processNode.info.monit?.cpu.set(cpu); // Update the CPU usage
        return { heapData, memory, cpu };
    }
    async _initVmContext(graph, agentName) {
        let existingNode = await graph.getContext(agentName);
        if (!existingNode || existingNode.getType().get() !== utils_1.VM_CONTEXT_NODE_TYPE) {
            existingNode = new spinal_model_graph_1.SpinalContext(agentName, utils_1.VM_CONTEXT_NODE_TYPE);
            await graph.addContext(existingNode);
        }
        await (0, utils_1.waitUntil)(() => typeof existingNode._server_id !== "undefined", 1000);
        return existingNode;
    }
    ////////////////////////////////////////////////
    // PM2 Processes Management
    ////////////////////////////////////////////////
    async _initPm2Processes(context, pm2Instances) {
        await this._initializeExistingPm2Processes(context);
        await this.syncPm2Processes(pm2Instances);
        await this.updatePm2ProcessesMetrics(pm2Instances);
        console.log("PM2 processes initialized and updated successfully.");
        // await this._watchAndSyncLogs();
    }
    async _addPm2ProcessToGraph(pm2Process) {
        if (!this.vmContext)
            return null;
        const existingNode = this.pm2Maps.get(pm2Process.pm_id) || this.pm2Maps.get(pm2Process.name);
        if (existingNode)
            return existingNode;
        const node = new spinal_model_graph_1.SpinalNode(pm2Process.name, utils_1.PM2_PROCESS_NODE_TYPE);
        // await waitUntil(() => typeof node._server_id !== "undefined", 1000);
        node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));
        if (pm2Process.pm_id)
            this.pm2Maps.set(pm2Process.pm_id, node);
        // await this._addLogRelationToPm2Process(node);
        return this.vmContext.addChildInContext(node, utils_1.HAS_PM2_PROCESS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, this.vmContext);
    }
    async _initializeExistingPm2Processes(context) {
        const existingProcesses = await context.getChildren(utils_1.HAS_PM2_PROCESS_RELATION_NAME);
        for (const process of existingProcesses) {
            // const name = process.getName().get();
            const pm_id = process.info?.pm_id?.get() || process.info?.name?.get();
            if (pm_id)
                this.pm2Maps.set(pm_id, process);
        }
    }
    async _addLogRelationToPm2Process(node) {
        const logPath = (0, utils_1._initLogPathInHub)(node.getName().get());
        const logNode = new spinal_model_graph_1.SpinalNode(`${node.getName().get()}.log`, utils_1.PM2_LOG_NODE_TYPE, logPath);
        return node.addChild(logNode, utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    _buildPm2ProcessNodeInfo(pm2Process) {
        const pm2Env = pm2Process.pm2_env;
        return {
            pm_id: pm2Process.pm_id,
            status: pm2Env?.status,
            restarts: pm2Env?.restart_time,
            uptime: pm2Env?.pm_uptime,
            heapMemory: (0, utils_1.getHeapInfo)(pm2Process),
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
    async _watchAndSyncLogs() {
        const promises = Array.from(this.pm2Maps.entries()).map(async ([key, processNode]) => {
            try {
                if (processNode.getName().get() == "spinal-core-hub-8010")
                    return; // Skip if the node has a name, indicating it's already processed
                const dynamicId = processNode._server_id;
                if (this._logSyncked.has(dynamicId))
                    return;
                const logPath = await this._syncLogForProcess(processNode);
                if (logPath)
                    this._logSyncked.set(dynamicId, logPath);
            }
            catch (error) {
                console.error(`Error processing PM2 process node for key ${key}:`, error);
            }
        });
        return Promise.all(promises);
    }
    async _syncLogForProcess(processNode) {
        return new Promise(async (resolve, reject) => {
            try {
                const pathNodes = await processNode.getChildren([utils_1.HAS_LOG]);
                let logPathNode = pathNodes.find((child) => child.getType().get() === utils_1.PM2_LOG_NODE_TYPE);
                if (!logPathNode)
                    logPathNode = await this._addLogRelationToPm2Process(processNode);
                const pathModel = await logPathNode.getElement(true);
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
            }
            catch (error) {
                reject(error);
            }
        });
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
                if (pathWatched) {
                    fs.unwatchFile(pathWatched);
                    this._logSyncked.delete(processNode._server_id);
                }
                return result;
            });
        });
    }
}
exports.SpinalGraphService = SpinalGraphService;
exports.default = SpinalGraphService;
//# sourceMappingURL=SpinalGraphService.js.map
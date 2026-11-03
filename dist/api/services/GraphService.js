"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const utils_1 = require("../../utils");
const EndpointService_1 = require("./EndpointService");
const models_1 = require("../models");
const SpinalhubService_1 = __importDefault(require("./SpinalhubService"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const utils_2 = require("../controllers/utils");
const endpointService = EndpointService_1.EndpointService.getInstance();
class GraphService {
    constructor() {
        this._graph = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new GraphService();
        }
        return this._instance;
    }
    setGraph(graph) {
        this._graph = graph;
    }
    getGraph() {
        if (this._graph)
            return this._graph;
        const graph = SpinalhubService_1.default.getInstance().getGraph();
        this._graph = graph;
        return graph;
    }
    async registerVirtualMachine(hostName, data) {
        let existingNode = await this.createOrRetrieveVmContext(this.getGraph(), hostName);
        const { systemMetrics, pm2List } = data || {};
        if (systemMetrics)
            await this.updateOrCreateSystemMetrics(existingNode, systemMetrics, true);
        if (pm2List)
            await this.updateOrCreatePm2Process(existingNode, pm2List, true, true);
        await this._initCommandList(existingNode);
        return existingNode;
    }
    async getVirtualMachine(vmKey) {
        const contexts = await this.getGraph()?.getChildren();
        for (const context of contexts || []) {
            if (context.getName().get() == vmKey || context.getId().get() == vmKey || context.info?.macAddress?.get() == vmKey || context._server_id == vmKey) {
                return context;
            }
        }
        return null;
    }
    async executeCommand(vmNode, type, processesIds) {
        const command = new models_1.SpinalCommand(type, processesIds, vmNode);
        await this._initCommandList(vmNode, command);
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                command.status.set(utils_1.SPINAL_COMMAND_STATUS.timeout);
            }, utils_1.SPINAL_COMMAND_TIMEOUT_MS);
            command.status.bind(() => {
                const status = command.status.get();
                if (status === utils_1.SPINAL_COMMAND_STATUS.completed || status === utils_1.SPINAL_COMMAND_STATUS.failed) {
                    clearTimeout(timeoutId);
                    const results = command.executionResult.get();
                    resolve(results);
                }
                else if (status === utils_1.SPINAL_COMMAND_STATUS.timeout) {
                    clearTimeout(timeoutId);
                    reject(new Error(`Command execution timed out`));
                }
            });
        });
    }
    async _initCommandList(vmNode, spinalCommand) {
        let commandLst = null;
        if (!vmNode?.info.pm2_commands) {
            commandLst = new spinal_core_connectorjs_1.Lst([]);
            vmNode.info.add_attr({ pm2_commands: new spinal_core_connectorjs_1.Ptr(commandLst) });
        }
        else if (vmNode?.info.pm2_commands) {
            commandLst = await vmNode.info.pm2_commands.load();
        }
        if (spinalCommand)
            commandLst.push(spinalCommand);
        if (vmNode.info.lastCommand)
            vmNode.info.lastCommand.set(Date.now());
        else
            vmNode.info.add_attr("lastCommand", Date.now());
        return commandLst;
    }
    async getAllVirtualMachines() {
        const contexts = await this.getGraph()?.getChildren();
        return (contexts || []).filter((context) => context instanceof spinal_model_graph_1.SpinalContext && context.getType().get() === utils_1.VM_CONTEXT_NODE_TYPE);
    }
    updateOrCreateSystemMetrics(vmNode, systemMetrics, isInit = false) {
        for (const [key, value] of Object.entries(systemMetrics)) {
            if (vmNode.info[key])
                vmNode.info[key].set(value);
            else
                vmNode.info.add_attr(key, value);
        }
        return endpointService.updateOrCreateMetricsEndpoints(vmNode, systemMetrics, isInit);
    }
    async getPm2ProcessesNodesAsObj(context) {
        const existingProcesses = await context.getChildren(utils_1.HAS_PM2_PROCESS_RELATION_NAME);
        const obj = Object.create(null);
        for (const process of existingProcesses) {
            const pmId = process.info?.pm_id?.get();
            const name = process.getName().get();
            if (pmId !== undefined && pmId !== null)
                obj[pmId] = process;
            if (name)
                obj[name] = process;
        }
        return obj;
    }
    async getPm2ProcessesNodes(vmNode) {
        const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);
        return Array.from(new Set(Object.values(existingProcessesObj)));
    }
    async getPm2ProcessClassifiedByBos(vmNode) {
        const processes = await this.getPm2ProcessesNodes(vmNode);
        const classified = [];
        for (const processNode of processes) {
            const { keys, meta } = this._getBosClassificationData(processNode);
            let processFound = classified.find((item) => {
                const found = item.keys.some((key) => keys.includes(key));
                return found;
            });
            if (processFound) {
                processFound = this.consolidateGroupInfo(processFound, meta);
                processFound.processes.push(processNode);
                continue;
            }
            classified.push({ keys, ...meta, processes: [processNode] });
        }
        return classified.map(({ keys, ...withoutKeys }) => withoutKeys);
    }
    async updateOrCreatePm2Process(vmNode, pm2Process, isInit = false, reconcileSnapshot = false) {
        const nodes = await this._syncPm2Processes(vmNode, pm2Process, reconcileSnapshot);
        const existingNodes = nodes.reduce((acc, node) => {
            const pmId = node.info?.pm_id?.get();
            const name = node.getName().get();
            if (pmId !== undefined && pmId !== null)
                acc[pmId] = node;
            if (name)
                acc[name] = node;
            return acc;
        }, Object.create(null));
        await this.updatePm2ProcessesMetrics(vmNode, pm2Process, existingNodes, isInit);
        return nodes;
    }
    async getPm2ProcessNodeByKey(vmNode, key) {
        const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);
        return Object.values(existingProcessesObj).find((node) => {
            const pm_id = node.info?.pm_id?.get();
            const name = node.getName().get();
            return key == pm_id || key == name;
        });
    }
    async handlePm2Event(vmNode, event) {
        if (event.type === utils_1.PROCESS_DELETE) {
            const processKey = event.process?.pm_id ?? event.process?.name;
            if (processKey === undefined || processKey === null)
                return null;
            const processNode = await this.getPm2ProcessNodeByKey(vmNode, processKey);
            if (processNode)
                await this.removePm2ProcessFromGraph(vmNode, processNode);
            return null;
        }
        const processData = event.process;
        if (!processData)
            return null;
        const [processFound] = await this.updateOrCreatePm2Process(vmNode, [processData]);
        // change organ config_data
        if (event.type === utils_1.PROCESS_CONFIG_DATA_CHANGE) {
            return this._updateOrganConfigData(processFound, event.data);
        }
        if (event.type === utils_1.PROCESS_HUB_DATA_RESPONSE) {
            return this._updateOrganHubData(processFound, event.data);
        }
        return processFound;
    }
    async updatePm2ProcessesMetrics(vmNode, pm2Processes, existingNodes, isInit = false) {
        if (!Array.isArray(pm2Processes))
            pm2Processes = [pm2Processes];
        const promises = [];
        if (!existingNodes)
            existingNodes = await this.getPm2ProcessesNodesAsObj(vmNode);
        for (const pm2Process of pm2Processes) {
            const processNode = existingNodes[pm2Process.pm_id] || existingNodes[pm2Process.name] || existingNodes[pm2Process.pid];
            if (!processNode)
                continue;
            this._updateInfo(processNode, pm2Process);
            promises.push(endpointService.updateOrCreatePm2ProcessEndpoints(processNode, isInit));
        }
        return Promise.all(promises);
    }
    _updateInfo(pm2Node, pm2Process) {
        const info = this._buildPm2ProcessNodeInfo(pm2Process);
        const memory = info.monit?.memory || 0;
        const cpu = info.monit?.cpu || 0;
        const heapInfo = info.heapMemory || {};
        pm2Node.info.monit.memory.set(memory);
        pm2Node.info.monit.cpu.set(cpu);
        pm2Node.info.heapMemory.set(heapInfo);
    }
    async initializeOrRetrievePm2LogsNodes(processNode, logType = "out") {
        const pathNodes = await processNode.getChildren([utils_1.HAS_LOG]);
        const logName = `${processNode.getName().get()}_${logType}.log`;
        let logPathNode = pathNodes.find((child) => child.getType().get() == utils_1.PM2_LOG_NODE_TYPE && child.getName().get() == logName);
        if (!logPathNode)
            logPathNode = await this._addLogRelationToPm2Process(processNode, logType);
        const pathModel = await logPathNode.getElement(true);
        const logPath = processNode.info?.log?.[logType]?.get();
        if (!logPath || !pathModel)
            return null;
        return { node: logPathNode, path: logPath, model: pathModel };
    }
    async updatePm2LogFileContent(processNode, logType = "out", content) {
        const logNodeData = await this.initializeOrRetrievePm2LogsNodes(processNode, logType);
        if (!logNodeData)
            throw new Error(`Log node for type ${logType} not found`);
        return (0, utils_1.uploadFileNewData)(logNodeData.model, Buffer.from(content));
    }
    async readPm2LogFileContent(processNode, logType = "out") {
        const logNodeData = await this.initializeOrRetrievePm2LogsNodes(processNode, logType);
        if (!logNodeData)
            return null;
        const { model } = logNodeData;
        try {
            return (0, utils_1.readFileContent)(model);
        }
        catch (error) {
            return null;
        }
    }
    async getPm2ProcessLogsByKey(processNode, tail = 100, logType = "all") {
        try {
            const logs = {
                name: processNode.getName().get(),
                pm_id: processNode.info?.pm_id?.get() || 0,
                tail,
                stdout: [],
                stderr: [],
            };
            if (logType === "out" || logType === "all") {
                logs.stdout = (await this.readPm2LogFileContent(processNode, "out")) || [];
                if (tail && logs.stdout.length > tail)
                    logs.stdout = logs.stdout.slice(-tail);
            }
            if (logType === "err" || logType === "all") {
                logs.stderr = (await this.readPm2LogFileContent(processNode, "err")) || [];
                if (tail && logs.stderr.length > tail)
                    logs.stderr = logs.stderr.slice(-tail);
            }
            return logs;
        }
        catch (error) {
            return null;
        }
    }
    async removePm2ProcessFromGraph(vmNode, processNode) {
        const processFound = typeof processNode === "string" ? await this.getPm2ProcessNodeByKey(vmNode, processNode) : processNode;
        if (!processFound)
            throw new Error(`Process is not in this vm`);
        const processes = await vmNode.getChildren(utils_1.HAS_PM2_PROCESS_RELATION_NAME);
        if (!processes.some((process) => process._server_id === processFound._server_id)) {
            throw new Error(`Process is not in this vm`);
        }
        await vmNode.removeChild(processFound, utils_1.HAS_PM2_PROCESS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        await processFound.removeRelation(utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        return processFound;
    }
    async createOrRetrieveVmContext(graph, hostName) {
        let existingNode = await graph.getContext(hostName);
        if (!existingNode || existingNode.getType().get() !== utils_1.VM_CONTEXT_NODE_TYPE) {
            existingNode = new spinal_model_graph_1.SpinalContext(hostName, utils_1.VM_CONTEXT_NODE_TYPE);
            await graph.addContext(existingNode);
        }
        await (0, utils_1.waitUntil)(() => typeof existingNode._server_id !== "undefined", 1000);
        return existingNode;
    }
    async _syncPm2Processes(context, pm2Processes, reconcileSnapshot) {
        const existingPm2Processes = await this.getPm2ProcessesNodesAsObj(context);
        const nodes = [];
        for (const pm2Process of pm2Processes) {
            const processKey = pm2Process.pm_id ?? pm2Process.name;
            let processAlreadyExist = processKey === undefined ? null : existingPm2Processes[processKey] || null;
            if (processAlreadyExist && processAlreadyExist.getName().get() === pm2Process.name) {
                this._updatePm2ProcessNodeInfo(processAlreadyExist, pm2Process);
            }
            else if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
                if (processAlreadyExist) {
                    await this.removePm2ProcessFromGraph(context, processAlreadyExist);
                    for (const [key, node] of Object.entries(existingPm2Processes)) {
                        if (node === processAlreadyExist)
                            delete existingPm2Processes[key];
                    }
                }
                processAlreadyExist = await this._addPm2ProcessToGraph(context, pm2Process);
                if (processAlreadyExist) {
                    if (pm2Process.pm_id !== undefined && pm2Process.pm_id !== null)
                        existingPm2Processes[pm2Process.pm_id] = processAlreadyExist;
                    if (pm2Process.name)
                        existingPm2Processes[pm2Process.name] = processAlreadyExist;
                }
            }
            if (processAlreadyExist)
                nodes.push(processAlreadyExist);
        }
        if (reconcileSnapshot) {
            const activeNodes = new Set(nodes);
            const existingNodes = await this.getPm2ProcessesNodes(context);
            for (const node of existingNodes) {
                if (!activeNodes.has(node))
                    await this.removePm2ProcessFromGraph(context, node);
            }
        }
        return nodes;
    }
    async _addPm2ProcessToGraph(vmContext, pm2Process) {
        const node = new spinal_model_graph_1.SpinalNode(pm2Process.name, utils_1.PM2_PROCESS_NODE_TYPE);
        node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));
        return vmContext.addChildInContext(node, utils_1.HAS_PM2_PROCESS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, vmContext);
    }
    async _addLogRelationToPm2Process(node, logType) {
        const pm2LogPath = node.info?.log?.[logType]?.get();
        const logPathModel = await (0, utils_1._initLogPathInHub)(pm2LogPath);
        const logNode = new spinal_model_graph_1.SpinalNode(`${node.getName().get()}_${logType}.log`, utils_1.PM2_LOG_NODE_TYPE, logPathModel);
        return node.addChild(logNode, utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    _buildPm2ProcessNodeInfo(pm2Process) {
        const pm2Env = pm2Process.pm2_env;
        return {
            pm_id: pm2Process.pm_id,
            pid: pm2Process.pid,
            status: pm2Env?.status,
            restarts: pm2Env?.restart_time,
            uptime: pm2Env?.pm_uptime,
            heapMemory: (0, utils_1.getHeapInfo)(pm2Process),
            monit: {
                memory: pm2Process.monit?.memory,
                cpu: pm2Process.monit?.cpu,
            },
            cwd: pm2Env?.pm_cwd,
            created_at: pm2Env?.created_at,
            log: {
                out: pm2Env?.pm_out_log_path,
                err: pm2Env?.pm_err_log_path,
            },
        };
    }
    _updateOrganConfigData(processNode, configData) {
        if (!processNode.info.configFile)
            processNode.info.add_attr("configFile", configData);
        else
            processNode.info.configFile.set(configData);
        return processNode;
    }
    _updateOrganHubData(processNode, hubData) {
        if (!processNode.info.hubData)
            processNode.info.add_attr("hubData", hubData);
        else
            processNode.info.hubData.set(hubData);
        return processNode;
    }
    _updatePm2ProcessNodeInfo(processNode, pm2Process) {
        const updatedInfo = this._buildPm2ProcessNodeInfo(pm2Process);
        for (const key in updatedInfo) {
            const value = updatedInfo[key];
            if (typeof value === "undefined")
                continue;
            if (processNode.info[key])
                processNode.info[key].set(value);
            else
                processNode.info.add_attr(key, value);
        }
        return processNode;
    }
    _getBosClassificationData(processNode) {
        const processFormatted = (0, utils_2._formatPm2Process)(processNode);
        const { bosName, protocol, url, port } = processFormatted.bosData || {};
        const hasConnectionData = Boolean(protocol && url && port);
        const keys = [];
        if (bosName)
            keys.push(bosName);
        if (hasConnectionData)
            keys.push(`${protocol}://${url}:${port}/${bosName}`);
        if (hasConnectionData) {
            return {
                keys,
                meta: { protocol, url, port, bosName },
            };
        }
        return { keys, meta: { bosName } };
    }
    consolidateGroupInfo(targetObj, sourceObj) {
        for (const key in sourceObj) {
            if (key === "processes" || key === "keys")
                continue; // skip the processes array as it is handled separately
            const value = sourceObj[key];
            // Merge the group's key-value pairs into the mergedGroup, handling arrays and objects appropriately
            const existingValue = targetObj[key];
            if (existingValue === undefined) {
                targetObj[key] = value;
            }
            else if (Array.isArray(existingValue) && Array.isArray(value)) {
                targetObj[key] = [...existingValue, ...value];
            }
            else if (existingValue && value && typeof existingValue === "object" && typeof value === "object" && !Array.isArray(existingValue) && !Array.isArray(value)) {
                targetObj[key] = { ...existingValue, ...value };
            }
        }
        return targetObj;
    }
}
exports.GraphService = GraphService;
exports.default = GraphService;
//# sourceMappingURL=GraphService.js.map
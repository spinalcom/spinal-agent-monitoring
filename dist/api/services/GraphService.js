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
        this.pm2Maps = new Map();
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
            await this.updateOrCreatePm2Process(existingNode, pm2List);
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
        return new Promise(async (resolve, reject) => {
            const command = new models_1.SpinalCommand(type, processesIds, vmNode);
            await this._initCommandList(vmNode, command);
            const timeoutId = setTimeout(() => {
                command.status.set(utils_1.SPINAL_COMMAND_STATUS.timeout);
            }, 10000);
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
        return (contexts || []).filter((context) => context instanceof spinal_model_graph_1.SpinalContext);
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
        const obj = {};
        for (const process of existingProcesses) {
            const pm_id = process.info?.pm_id?.get() || process.info?.name?.get();
            if (pm_id)
                obj[pm_id] = process;
        }
        return obj;
    }
    async getPm2ProcessesNodes(vmNode) {
        const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);
        return Object.values(existingProcessesObj);
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
    async updateOrCreatePm2Process(vmNode, pm2Process) {
        const nodes = await this._syncPm2Processes(vmNode, pm2Process);
        const existingNodes = nodes.reduce((acc, node) => {
            const pm_id = node.info?.pm_id?.get() || node.info?.name?.get();
            if (pm_id)
                acc[pm_id] = node;
            return acc;
        }, {});
        await this.updatePm2ProcessesMetrics(vmNode, pm2Process, existingNodes, true);
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
        // const processKey = event.process.pm_id ?? event.process.name;
        const processData = event.process;
        const [processFound] = await this.updateOrCreatePm2Process(vmNode, [processData]);
        // change organ config_data
        if (event.type === utils_1.PROCESS_CONFIG_DATA_CHANGE) {
            return this._updateOrganConfigData(processFound, event.data);
        }
        if (event.type === utils_1.PROCESS_HUB_DATA_RESPONSE) {
            return this._updateOrganHubData(processFound, event.data);
        }
        return processFound;
        // const promises = [];
        // const isErrorEvent = ["errored", "error"].includes(eventType);
        // if (isErrorEvent) promises.push(endpointService._updateErroredEndpoint(processFound, 1));
        // promises.push(this.updateOrCreatePm2Process(vmNode, [processData]));
        // const value = ["stop", "stopped", "restart", "restarted", "exit", "errored", "error"].includes(eventType) ? 1 : 0;
        // promises.push(endpointService._updateRebootEndpoint(processFound, value));
        // promises.push(this.updateOrCreatePm2Process(vmNode, [processData]));
        // return Promise.all(promises);
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
        const processKey = typeof processNode == "string" ? processNode : processNode.info?.pm_id?.get() || processNode.getName().get();
        // I use the process key to retrieve the actual process node from the graph
        // This ensures that the process is linked to the graph correctly before attempting removal
        const processFound = await this.getPm2ProcessNodeByKey(vmNode, processKey);
        if (!processFound)
            throw new Error(`Process is not in this vm`);
        return vmNode.removeChild(processFound, utils_1.HAS_PM2_PROCESS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE).then(async () => {
            await processFound.removeRelation(utils_1.HAS_LOG, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
        // return processNode.removeFromGraph().then(async () => {
        // 	// const name = processNode.getName().get();
        // 	// const pm_id = processNode.info?.pm_id?.get();
        // 	// if (name) this.pm2Maps.delete(name);
        // 	// if (pm_id) this.pm2Maps.delete(pm_id);
        // 	await processNode.removeRelation(HAS_LOG, SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
        // 		const pathWatched = this._logSyncked.get(processNode._server_id as number);
        // 		if (pathWatched) {
        // 			fs.unwatchFile(pathWatched);
        // 			this._logSyncked.delete(processNode._server_id as number);
        // 		}
        // 		return result;
        // 	});
        // });
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
    async _syncPm2Processes(context, pm2Processes) {
        const existingPm2Processes = await this.getPm2ProcessesNodesAsObj(context);
        const nodes = [];
        for (const pm2Process of pm2Processes) {
            let processAlreadyExist = existingPm2Processes[pm2Process.pm_id] || existingPm2Processes[pm2Process.name] || null;
            if (processAlreadyExist && processAlreadyExist.getName().get() === pm2Process.name) {
                this._updatePm2ProcessNodeInfo(processAlreadyExist, pm2Process);
            }
            else if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
                if (processAlreadyExist)
                    await this.removePm2ProcessFromGraph(context, processAlreadyExist);
                // Add the new process to the graph and update the map
                processAlreadyExist = await this._addPm2ProcessToGraph(context, pm2Process);
                const key = pm2Process.pm_id ?? pm2Process.name;
                if (processAlreadyExist && key)
                    existingPm2Processes[key] = processAlreadyExist;
            }
            if (processAlreadyExist)
                nodes.push(processAlreadyExist);
        }
        const promises = nodes.map(async (node) => endpointService.updateOrCreatePm2ProcessEndpoints(node));
        return Promise.all(promises).then(() => {
            return nodes;
        });
    }
    async _addPm2ProcessToGraph(vmContext, pm2Process) {
        const existingNode = this.pm2Maps.get(pm2Process.pm_id) || this.pm2Maps.get(pm2Process.name);
        if (existingNode)
            return existingNode;
        const node = new spinal_model_graph_1.SpinalNode(pm2Process.name, utils_1.PM2_PROCESS_NODE_TYPE);
        node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));
        if (pm2Process.pm_id)
            this.pm2Maps.set(pm2Process.pm_id, node);
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
            // logPathInHub: this._initLogPathInHub(pm2Process.name as string),
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
    // private _getClassificationKey(processNode: SpinalNode): string[] {
    // 	const processFormatted = _formatPm2Process(processNode);
    // 	const { bosName, protocol, host, port } = processFormatted.bosData || {};
    // 	const keys = [bosName];
    // 	const hasConnectionData = Boolean(protocol && host && port && bosName);
    // 	if (hasConnectionData) keys.push(`${protocol}://${host}:${port}/${bosName}`);
    // 	if (bosName) keys.push(bosName);
    // 	return keys;
    // }
    // private _mergeByBosName(classifiedProcesses: { [key: string]: any; processes: SpinalNode[] }[]): { [key: string]: any; processes: SpinalNode[] }[] {
    // 	const mergedByBosName: Record<string, { [key: string]: any; processes: SpinalNode[] }> = {};
    // 	for (const group of classifiedProcesses) {
    // 		const bosName = group.bosName || "unknown";
    // 		if (!mergedByBosName[bosName]) {
    // 			mergedByBosName[bosName] = {
    // 				processes: [],
    // 				bosName,
    // 			};
    // 		}
    // 		const mergedGroup = mergedByBosName[bosName];
    // 		this.consolidateGroupInfo(group, mergedGroup);
    // 		mergedGroup.processes.push(...group.processes);
    // 	}
    // 	return Object.values(mergedByBosName);
    // }
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
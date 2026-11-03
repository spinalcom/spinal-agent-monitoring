import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { _initLogPathInHub, getHeapInfo, HAS_LOG, HAS_PM2_PROCESS_RELATION_NAME, METRICS_ENDPOINTS, PM2_LOG_NODE_TYPE, PM2_PROCESS_NODE_TYPE, PROCESS_CONFIG_DATA_CHANGE, PROCESS_DELETE, PROCESS_HUB_DATA_RESPONSE, readFileContent, SPINAL_COMMAND_STATUS, SPINAL_COMMAND_TIMEOUT_MS, uploadFileNewData, VM_CONTEXT_NODE_TYPE, waitUntil, SpinalCommandAction } from "../../utils";
import { ActionResponse, IPm2EventData, ISystemMetrics, Pm2ProcessLogsResponse } from "../../interfaces";
import { EndpointService } from "./EndpointService";
import { SpinalCommand } from "../models";
import SpinalhubService from "./SpinalhubService";
import { ProcessDescription } from "pm2";
import { Lst, Ptr } from "spinal-core-connectorjs";
import { _formatPm2Process } from "../controllers/utils";

const endpointService = EndpointService.getInstance();

export class GraphService {
	private static _instance: GraphService;
	private _graph: SpinalGraph | null = null;

	private constructor() {}

	public static getInstance(): GraphService {
		if (!this._instance) {
			this._instance = new GraphService();
		}
		return this._instance;
	}

	public setGraph(graph: SpinalGraph): void {
		this._graph = graph;
	}

	public getGraph(): SpinalGraph | null {
		if (this._graph) return this._graph;
		const graph = SpinalhubService.getInstance().getGraph();
		this._graph = graph;
		return graph;
	}

	async registerVirtualMachine(hostName: string, data?: { systemMetrics?: ISystemMetrics; pm2List?: ProcessDescription[] }): Promise<SpinalContext> {
		let existingNode = await this.createOrRetrieveVmContext(this.getGraph()!, hostName);
		const { systemMetrics, pm2List } = data || {};
		if (systemMetrics) await this.updateOrCreateSystemMetrics(existingNode, systemMetrics, true);
		if (pm2List) await this.updateOrCreatePm2Process(existingNode, pm2List, true, true);

		await this._initCommandList(existingNode);

		return existingNode;
	}

	public async getVirtualMachine(vmKey: string | number): Promise<SpinalContext | null> {
		const contexts = await this.getGraph()?.getChildren();
		for (const context of contexts || []) {
			if (context.getName().get() == vmKey || context.getId().get() == vmKey || context.info?.macAddress?.get() == vmKey || context._server_id == vmKey) {
				return context as SpinalContext;
			}
		}

		return null;
	}

	public async executeCommand(vmNode: SpinalContext, type: SpinalCommandAction, processesIds?: string | number | (string | number)[]): Promise<ActionResponse[]> {
		const command = new SpinalCommand(type, processesIds, vmNode);
		await this._initCommandList(vmNode, command);

		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				command.status.set(SPINAL_COMMAND_STATUS.timeout);
			}, SPINAL_COMMAND_TIMEOUT_MS);

			command.status.bind(() => {
				const status = command.status.get();
				if (status === SPINAL_COMMAND_STATUS.completed || status === SPINAL_COMMAND_STATUS.failed) {
					clearTimeout(timeoutId);
					const results = command.executionResult.get();
					resolve(results);
				} else if (status === SPINAL_COMMAND_STATUS.timeout) {
					clearTimeout(timeoutId);
					reject(new Error(`Command execution timed out`));
				}
			});
		});
	}

	private async _initCommandList(vmNode: SpinalContext, spinalCommand?: SpinalCommand): Promise<Lst | null> {
		let commandLst = null;
		if (!vmNode?.info.pm2_commands) {
			commandLst = new Lst([]);
			vmNode.info.add_attr({ pm2_commands: new Ptr(commandLst) });
		} else if (vmNode?.info.pm2_commands) {
			commandLst = await vmNode.info.pm2_commands.load();
		}

		if (spinalCommand) commandLst.push(spinalCommand);

		if (vmNode.info.lastCommand) vmNode.info.lastCommand.set(Date.now());
		else vmNode.info.add_attr("lastCommand", Date.now());

		return commandLst;
	}

	public async getAllVirtualMachines(): Promise<SpinalContext[]> {
		const contexts = await this.getGraph()?.getChildren();
		return (contexts || []).filter((context) => context instanceof SpinalContext && context.getType().get() === VM_CONTEXT_NODE_TYPE) as SpinalContext[];
	}

	public updateOrCreateSystemMetrics(vmNode: SpinalContext, systemMetrics: ISystemMetrics, isInit: boolean = false) {
		for (const [key, value] of Object.entries(systemMetrics)) {
			if (vmNode.info[key]) vmNode.info[key].set(value);
			else vmNode.info.add_attr(key, value);
		}

		return endpointService.updateOrCreateMetricsEndpoints(vmNode, systemMetrics, isInit);
	}

	public async getPm2ProcessesNodesAsObj(context: SpinalContext): Promise<{ [key: string]: SpinalNode }> {
		const existingProcesses = await context.getChildren(HAS_PM2_PROCESS_RELATION_NAME);
		const obj = Object.create(null) as { [key: string]: SpinalNode };

		for (const process of existingProcesses) {
			const pmId = process.info?.pm_id?.get();
			const name = process.getName().get();
			if (pmId !== undefined && pmId !== null) obj[pmId] = process;
			if (name) obj[name] = process;
		}

		return obj;
	}

	public async getPm2ProcessesNodes(vmNode: SpinalContext): Promise<SpinalNode[]> {
		const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);
		return Array.from(new Set(Object.values(existingProcessesObj)));
	}

	public async getPm2ProcessClassifiedByBos(vmNode: SpinalContext): Promise<{ [key: string]: any; processes: SpinalNode[] }[]> {
		const processes = await this.getPm2ProcessesNodes(vmNode);

		const classified: any[] = [];

		for (const processNode of processes) {
			const { keys, meta } = this._getBosClassificationData(processNode);

			let processFound = classified.find((item) => {
				const found = item.keys.some((key: string) => keys.includes(key));
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

	public async updateOrCreatePm2Process(vmNode: SpinalContext, pm2Process: ProcessDescription[], isInit: boolean = false, reconcileSnapshot: boolean = false): Promise<SpinalNode[]> {
		const nodes = await this._syncPm2Processes(vmNode, pm2Process, reconcileSnapshot);

		const existingNodes = nodes.reduce((acc, node) => {
			const pmId = node.info?.pm_id?.get();
			const name = node.getName().get();
			if (pmId !== undefined && pmId !== null) acc[pmId] = node;
			if (name) acc[name] = node;
			return acc;
		}, Object.create(null) as { [key: string]: SpinalNode });

		await this.updatePm2ProcessesMetrics(vmNode, pm2Process, existingNodes, isInit);

		return nodes;
	}

	public async getPm2ProcessNodeByKey(vmNode: SpinalContext, key: string | number): Promise<SpinalNode | undefined> {
		const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);

		return Object.values(existingProcessesObj).find((node) => {
			const pm_id = node.info?.pm_id?.get();
			const name = node.getName().get();

			return key == pm_id || key == name;
		});
	}

	public async handlePm2Event(vmNode: SpinalContext, event: IPm2EventData) {
		if (event.type === PROCESS_DELETE) {
			const processKey = event.process?.pm_id ?? event.process?.name;
			if (processKey === undefined || processKey === null) return null;

			const processNode = await this.getPm2ProcessNodeByKey(vmNode, processKey);
			if (processNode) await this.removePm2ProcessFromGraph(vmNode, processNode);
			return null;
		}

		const processData = event.process;
		if (!processData) return null;

		const [processFound] = await this.updateOrCreatePm2Process(vmNode, [processData]);

		// change organ config_data
		if (event.type === PROCESS_CONFIG_DATA_CHANGE) {
			return this._updateOrganConfigData(processFound, event.data);
		}

		if (event.type === PROCESS_HUB_DATA_RESPONSE) {
			return this._updateOrganHubData(processFound, event.data);
		}

		return processFound;
	}

	public async updatePm2ProcessesMetrics(vmNode: SpinalContext, pm2Processes: ProcessDescription | ProcessDescription[], existingNodes?: { [key: string]: SpinalNode }, isInit: boolean = false) {
		if (!Array.isArray(pm2Processes)) pm2Processes = [pm2Processes];
		const promises = [];
		if (!existingNodes) existingNodes = await this.getPm2ProcessesNodesAsObj(vmNode);

		for (const pm2Process of pm2Processes) {
			const processNode = existingNodes[pm2Process.pm_id as number] || existingNodes[pm2Process.name as string] || existingNodes[pm2Process.pid as number];
			if (!processNode) continue;

			this._updateInfo(processNode, pm2Process);

			promises.push(endpointService.updateOrCreatePm2ProcessEndpoints(processNode, isInit));
		}

		return Promise.all(promises);
	}

	private _updateInfo(pm2Node: SpinalNode, pm2Process: ProcessDescription) {
		const info = this._buildPm2ProcessNodeInfo(pm2Process);

		const memory = info.monit?.memory || 0;
		const cpu = info.monit?.cpu || 0;
		const heapInfo = info.heapMemory || {};

		pm2Node.info.monit.memory.set(memory);
		pm2Node.info.monit.cpu.set(cpu);
		pm2Node.info.heapMemory.set(heapInfo);
	}

	public async initializeOrRetrievePm2LogsNodes(processNode: SpinalNode, logType: "out" | "err" = "out"): Promise<{ node: SpinalNode; path: string; model: any } | null> {
		const pathNodes = await processNode.getChildren([HAS_LOG]);
		const logName = `${processNode.getName().get()}_${logType}.log`;

		let logPathNode = pathNodes.find((child) => child.getType().get() == PM2_LOG_NODE_TYPE && child.getName().get() == logName);
		if (!logPathNode) logPathNode = await this._addLogRelationToPm2Process(processNode, logType);

		const pathModel = await logPathNode.getElement(true);
		const logPath = processNode.info?.log?.[logType]?.get();

		if (!logPath || !pathModel) return null;

		return { node: logPathNode, path: logPath, model: pathModel };
	}

	public async updatePm2LogFileContent(processNode: SpinalNode, logType: "out" | "err" = "out", content: string): Promise<boolean> {
		const logNodeData = await this.initializeOrRetrievePm2LogsNodes(processNode, logType);
		if (!logNodeData) throw new Error(`Log node for type ${logType} not found`);

		return uploadFileNewData(logNodeData.model, Buffer.from(content));
	}

	public async readPm2LogFileContent(processNode: SpinalNode, logType: "out" | "err" = "out"): Promise<string[] | null> {
		const logNodeData = await this.initializeOrRetrievePm2LogsNodes(processNode, logType);
		if (!logNodeData) return null;

		const { model } = logNodeData;
		try {
			return readFileContent(model);
		} catch (error) {
			return null;
		}
	}

	public async getPm2ProcessLogsByKey(processNode: SpinalNode, tail: number = 100, logType: "out" | "err" | "all" = "all"): Promise<Pm2ProcessLogsResponse | null> {
		try {
			const logs: Pm2ProcessLogsResponse = {
				name: processNode.getName().get(),
				pm_id: processNode.info?.pm_id?.get() || 0,
				tail,
				stdout: [],
				stderr: [],
			};

			if (logType === "out" || logType === "all") {
				logs.stdout = (await this.readPm2LogFileContent(processNode, "out")) || [];
				if (tail && logs.stdout.length > tail) logs.stdout = logs.stdout.slice(-tail);
			}

			if (logType === "err" || logType === "all") {
				logs.stderr = (await this.readPm2LogFileContent(processNode, "err")) || [];
				if (tail && logs.stderr.length > tail) logs.stderr = logs.stderr.slice(-tail);
			}

			return logs;
		} catch (error) {
			return null;
		}
	}

	public async removePm2ProcessFromGraph(vmNode: SpinalContext, processNode: SpinalNode | string) {
		const processFound = typeof processNode === "string" ? await this.getPm2ProcessNodeByKey(vmNode, processNode) : processNode;
		if (!processFound) throw new Error(`Process is not in this vm`);

		const processes = await vmNode.getChildren(HAS_PM2_PROCESS_RELATION_NAME);
		if (!processes.some((process) => process._server_id === processFound._server_id)) {
			throw new Error(`Process is not in this vm`);
		}

		await vmNode.removeChild(processFound, HAS_PM2_PROCESS_RELATION_NAME, SPINAL_RELATION_PTR_LST_TYPE);
		await processFound.removeRelation(HAS_LOG, SPINAL_RELATION_PTR_LST_TYPE);
		return processFound;
	}

	public async createOrRetrieveVmContext(graph: SpinalGraph, hostName: string): Promise<SpinalContext> {
		let existingNode = await graph.getContext(hostName);

		if (!existingNode || existingNode.getType().get() !== VM_CONTEXT_NODE_TYPE) {
			existingNode = new SpinalContext(hostName, VM_CONTEXT_NODE_TYPE);
			await graph.addContext(existingNode);
		}

		await waitUntil(() => typeof existingNode._server_id !== "undefined", 1000);

		return existingNode as SpinalContext;
	}

	private async _syncPm2Processes(context: SpinalContext, pm2Processes: ProcessDescription[], reconcileSnapshot: boolean): Promise<SpinalNode[]> {
		const existingPm2Processes = await this.getPm2ProcessesNodesAsObj(context);
		const nodes: SpinalNode[] = [];

		for (const pm2Process of pm2Processes) {
			const processKey = pm2Process.pm_id ?? pm2Process.name;
			let processAlreadyExist: SpinalNode | null = processKey === undefined ? null : existingPm2Processes[processKey] || null;

			if (processAlreadyExist && processAlreadyExist.getName().get() === pm2Process.name) {
				this._updatePm2ProcessNodeInfo(processAlreadyExist, pm2Process);
			} else if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
				if (processAlreadyExist) {
					await this.removePm2ProcessFromGraph(context, processAlreadyExist);
					for (const [key, node] of Object.entries(existingPm2Processes)) {
						if (node === processAlreadyExist) delete existingPm2Processes[key];
					}
				}

				processAlreadyExist = await this._addPm2ProcessToGraph(context, pm2Process);
				if (processAlreadyExist) {
					if (pm2Process.pm_id !== undefined && pm2Process.pm_id !== null) existingPm2Processes[pm2Process.pm_id] = processAlreadyExist;
					if (pm2Process.name) existingPm2Processes[pm2Process.name] = processAlreadyExist;
				}
			}

			if (processAlreadyExist) nodes.push(processAlreadyExist);
		}

		if (reconcileSnapshot) {
			const activeNodes = new Set(nodes);
			const existingNodes = await this.getPm2ProcessesNodes(context);
			for (const node of existingNodes) {
				if (!activeNodes.has(node)) await this.removePm2ProcessFromGraph(context, node);
			}
		}

		return nodes;
	}

	private async _addPm2ProcessToGraph(vmContext: SpinalContext, pm2Process: ProcessDescription): Promise<SpinalNode | null> {
		const node = new SpinalNode(pm2Process.name, PM2_PROCESS_NODE_TYPE);

		node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));

		return vmContext.addChildInContext(node, HAS_PM2_PROCESS_RELATION_NAME, SPINAL_RELATION_PTR_LST_TYPE, vmContext);
	}

	private async _addLogRelationToPm2Process(node: SpinalNode, logType: "out" | "err"): Promise<SpinalNode> {
		const pm2LogPath = node.info?.log?.[logType]?.get();
		const logPathModel = await _initLogPathInHub(pm2LogPath);

		const logNode = new SpinalNode(`${node.getName().get()}_${logType}.log`, PM2_LOG_NODE_TYPE, logPathModel);

		return node.addChild(logNode, HAS_LOG, SPINAL_RELATION_PTR_LST_TYPE);
	}

	private _buildPm2ProcessNodeInfo(pm2Process: ProcessDescription) {
		const pm2Env = pm2Process.pm2_env as { [key: string]: unknown } | undefined;

		return {
			pm_id: pm2Process.pm_id,
			pid: pm2Process.pid,
			status: pm2Env?.status,
			restarts: pm2Env?.restart_time,
			uptime: pm2Env?.pm_uptime,
			heapMemory: getHeapInfo(pm2Process),
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

	private _updateOrganConfigData(processNode: SpinalNode, configData: { [key: string]: any }) {
		if (!processNode.info.configFile) processNode.info.add_attr("configFile", configData);
		else processNode.info.configFile.set(configData);

		return processNode;
	}

	private _updateOrganHubData(processNode: SpinalNode, hubData: { [key: string]: any }) {
		if (!processNode.info.hubData) processNode.info.add_attr("hubData", hubData);
		else processNode.info.hubData.set(hubData);

		return processNode;
	}

	private _updatePm2ProcessNodeInfo(processNode: SpinalNode, pm2Process: ProcessDescription) {
		const updatedInfo: any = this._buildPm2ProcessNodeInfo(pm2Process);

		for (const key in updatedInfo) {
			const value = updatedInfo[key];
			if (typeof value === "undefined") continue;

			if (processNode.info[key]) processNode.info[key].set(value);
			else processNode.info.add_attr(key, value);
		}

		return processNode;
	}

	private _getBosClassificationData(processNode: SpinalNode): { keys: string[]; meta: Record<string, any> } {
		const processFormatted = _formatPm2Process(processNode);

		const { bosName, protocol, url, port } = processFormatted.bosData || {};

		const hasConnectionData = Boolean(protocol && url && port);

		const keys: string[] = [];

		if (bosName) keys.push(bosName);
		if (hasConnectionData) keys.push(`${protocol}://${url}:${port}/${bosName}`);

		if (hasConnectionData) {
			return {
				keys,
				meta: { protocol, url, port, bosName },
			};
		}

		return { keys, meta: { bosName } };
	}

	private consolidateGroupInfo(targetObj: { [key: string]: any; processes: SpinalNode[] }, sourceObj: { [key: string]: any }) {
		for (const key in sourceObj) {
			if (key === "processes" || key === "keys") continue; // skip the processes array as it is handled separately

			const value = sourceObj[key];
			// Merge the group's key-value pairs into the mergedGroup, handling arrays and objects appropriately
			const existingValue = targetObj[key];

			if (existingValue === undefined) {
				targetObj[key] = value;
			} else if (Array.isArray(existingValue) && Array.isArray(value)) {
				targetObj[key] = [...existingValue, ...value];
			} else if (existingValue && value && typeof existingValue === "object" && typeof value === "object" && !Array.isArray(existingValue) && !Array.isArray(value)) {
				targetObj[key] = { ...existingValue, ...value };
			}
		}

		return targetObj;
	}
}

export default GraphService;

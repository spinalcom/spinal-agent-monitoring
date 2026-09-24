import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { _initLogPathInHub, getHeapInfo, HAS_LOG, HAS_PM2_PROCESS_RELATION_NAME, METRICS_ENDPOINTS, PM2_ENDPOINTS, PM2_LOG_NODE_TYPE, PM2_PROCESS_NODE_TYPE, readFileContent, SPINAL_COMMAND_STATUS, uploadFileNewData, VM_CONTEXT_NODE_TYPE, waitUntil } from "../../utils";
import { ActionResponse, IPm2EventData, ISystemMetrics, Pm2ProcessLogsResponse } from "../../interfaces";
import { ProcessDescription } from "pm2";
import { Lst, Ptr } from "spinal-core-connectorjs";
import { EndpointService } from "./EndpointService";
import { SpinalCommand } from "../models";
import SpinalhubService from "./SpinalhubService";

const endpointService = EndpointService.getInstance();

export class GraphService {
	private static _instance: GraphService;
	private _graph: SpinalGraph | null = null;

	public pm2Maps: Map<string | number, SpinalNode> = new Map();

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
		if (pm2List) await this.updateOrCreatePm2Process(existingNode, pm2List);

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

	public async executeCommand(vmNode: SpinalContext, type: string, processesIds?: string | number | (string | number)[]): Promise<ActionResponse[]> {
		return new Promise(async (resolve, reject) => {
			await this._initCommandList(vmNode);

			const command = new SpinalCommand(type as any, processesIds, vmNode);

			const timeoutId = setTimeout(() => {
				command.status.set(SPINAL_COMMAND_STATUS.timeout);
			}, 10000);

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

	private async _initCommandList(vmNode: SpinalContext): Promise<Lst | null> {
		let commandLst = null;
		if (!vmNode?.info.pm2_commands) {
			commandLst = new Lst([]);
			vmNode.info.add_attr({ pm2_commands: new Ptr(commandLst) });
		} else if (vmNode?.info.pm2_commands) {
			commandLst = await vmNode.info.pm2_commands.load();
		}

		if (vmNode.info.lastCommand) vmNode.info.lastCommand.set(Date.now());
		else vmNode.info.add_attr("lastCommand", Date.now());

		return commandLst;
	}

	public async getAllVirtualMachines(): Promise<SpinalContext[]> {
		const contexts = await this.getGraph()?.getChildren();
		return (contexts || []).filter((context) => context instanceof SpinalContext) as SpinalContext[];
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
		const obj: { [key: string]: SpinalNode } = {};

		for (const process of existingProcesses) {
			const pm_id = process.info?.pm_id?.get() || process.info?.name?.get();

			if (pm_id) obj[pm_id] = process;
		}

		return obj;
	}

	public async getPm2ProcessesNodes(vmNode: SpinalContext): Promise<SpinalNode[]> {
		const existingProcessesObj = await this.getPm2ProcessesNodesAsObj(vmNode);
		return Object.values(existingProcessesObj);
	}

	public async updateOrCreatePm2Process(vmNode: SpinalContext, pm2Process: ProcessDescription[]): Promise<SpinalNode[]> {
		const exstingNodes = await this._syncPm2Processes(vmNode, pm2Process);
		await this.updatePm2ProcessesMetrics(vmNode, pm2Process, exstingNodes, true);

		return Object.values(exstingNodes);
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
		const processKey = event.process.pm_id ?? event.process.name;

		let processFound = await this.getPm2ProcessNodeByKey(vmNode, processKey as string | number);

		if (!processFound) processFound = (await this._addPm2ProcessToGraph(vmNode, event.process)) as SpinalNode;

		// change organ config_data
		if (event.type == "process:config_data_change") return this._updateOrganConfigData(processFound, event.data);

		// it's a process event, update the reboot and errored endpoints
		const eventType = event.event || "";

		const promises = [];

		const isErrorEvent = ["errored", "error"].includes(eventType);
		if (isErrorEvent) promises.push(endpointService._updateErroredEndpoint(processFound, 1));

		const value = ["stop", "exit", "errored", "error"].includes(eventType) ? 0 : 1;
		promises.push(endpointService._updateRebootEndpoint(processFound, value));

		return Promise.all(promises);
	}

	public async updatePm2ProcessesMetrics(vmNode: SpinalContext, pm2Processes: ProcessDescription | ProcessDescription[], existingNodes?: { [key: string]: SpinalNode }, isInit: boolean = false) {
		if (!Array.isArray(pm2Processes)) pm2Processes = [pm2Processes];
		const promises = [];
		if (!existingNodes) existingNodes = await this.getPm2ProcessesNodesAsObj(vmNode);

		for (const pm2Process of pm2Processes) {
			const processNode = existingNodes[pm2Process.pm_id as number] || existingNodes[pm2Process.name as string];
			if (!processNode) continue;

			// const { heapData, memory, cpu } = this._updateInfo(processNode, pm2Process);

			promises.push(endpointService.updateOrCreatePm2ProcessEndpoints(processNode, isInit));
		}

		return Promise.all(promises);
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
		const processKey = typeof processNode == "string" ? processNode : processNode.info?.pm_id?.get() || processNode.getName().get();

		// I use the process key to retrieve the actual process node from the graph
		// This ensures that the process is linked to the graph correctly before attempting removal
		const processFound = await this.getPm2ProcessNodeByKey(vmNode, processKey);
		if (!processFound) throw new Error(`Process is not in this vm`);

		return vmNode.removeChild(processFound, HAS_PM2_PROCESS_RELATION_NAME, SPINAL_RELATION_PTR_LST_TYPE).then(async () => {
			await processFound.removeRelation(HAS_LOG, SPINAL_RELATION_PTR_LST_TYPE);
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

	public async createOrRetrieveVmContext(graph: SpinalGraph, hostName: string): Promise<SpinalContext> {
		let existingNode = await graph.getContext(hostName);

		if (!existingNode || existingNode.getType().get() !== VM_CONTEXT_NODE_TYPE) {
			existingNode = new SpinalContext(hostName, VM_CONTEXT_NODE_TYPE);
			await graph.addContext(existingNode);
		}

		await waitUntil(() => typeof existingNode._server_id !== "undefined", 1000);

		return existingNode as SpinalContext;
	}

	private async _syncPm2Processes(context: SpinalContext, pm2Processes: ProcessDescription[]) {
		const existingPm2Processes = await this.getPm2ProcessesNodesAsObj(context);
		const nodes = [];

		for (const pm2Process of pm2Processes) {
			let processAlreadyExist: SpinalNode | null = existingPm2Processes[pm2Process.pm_id as number] || existingPm2Processes[pm2Process.name as string] || null;

			if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
				if (processAlreadyExist) await this.removePm2ProcessFromGraph(context, processAlreadyExist);

				// Add the new process to the graph and update the map
				processAlreadyExist = await this._addPm2ProcessToGraph(context, pm2Process);
				const key = pm2Process.pm_id ?? pm2Process.name;
				if (processAlreadyExist && key) existingPm2Processes[key] = processAlreadyExist;
			}

			if (processAlreadyExist) nodes.push(processAlreadyExist);
		}

		const promises = nodes.map(async (node) => endpointService.updateOrCreatePm2ProcessEndpoints(node));
		return Promise.all(promises).then(() => {
			return existingPm2Processes;
		});
	}

	private async _addPm2ProcessToGraph(vmContext: SpinalContext, pm2Process: ProcessDescription): Promise<SpinalNode | null> {
		const existingNode = this.pm2Maps.get(pm2Process.pm_id as number) || this.pm2Maps.get(pm2Process.name as string);
		if (existingNode) return existingNode;

		const node = new SpinalNode(pm2Process.name, PM2_PROCESS_NODE_TYPE);

		node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));

		if (pm2Process.pm_id) this.pm2Maps.set(pm2Process.pm_id, node);

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
			status: pm2Env?.status,
			restarts: pm2Env?.restart_time,
			uptime: pm2Env?.pm_uptime,
			heapMemory: getHeapInfo(pm2Process),
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

	private _updateOrganConfigData(processNode: SpinalNode, configData: { [key: string]: any }) {
		if (!processNode.info.configFile) processNode.info.add_attr("configFile", configData);
		else processNode.info.configFile.set(configData);

		return processNode;
	}

	// private async _watchAndSyncLogs() {
	// 	const promises = Array.from(this.pm2Maps.entries()).map(async ([key, processNode]) => {
	// 		try {
	// 			const dynamicId: number = processNode._server_id as number;
	// 			let logPath: string | null = this._logSyncked.get(dynamicId) || null;

	// 			if (!logPath) {
	// 				logPath = await this._syncLogForProcess(processNode);
	// 				if (logPath) this._logSyncked.set(dynamicId, logPath);
	// 			}

	// 			return logPath;
	// 		} catch (error) {
	// 			console.error(`Error processing PM2 process node for key ${key}:`, error);
	// 		}
	// 	});

	// 	return Promise.all(promises);
	// }

	// private _watchFile(processName: string, logPath: string, pathModel: any, resolve: any) {
	// 	const debouncedUpdate = lodash.debounce(async (newData) => {
	// 		const isUploaded = await uploadFileNewData(pathModel, newData);
	// 		const message = isUploaded ? `${processName} Log data uploaded successfully` : `Failed to upload ${processName} log data`;
	// 		console.log(message);
	// 	}, 5000);

	// 	fs.watchFile(logPath, (curr, prev) => {
	// 		// no change
	// 		if (curr.size == prev.size) return;

	// 		const stream = fs.createReadStream(logPath, { encoding: "utf8" });
	// 		stream.on("data", (data) => debouncedUpdate(data));
	// 	});

	// 	resolve(logPath);
	// }

	// //TODO: stopped here
	// public async syncLogForProcess(processNode: SpinalNode): Promise<string | null> {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			const pathNodes = await processNode.getChildren([HAS_LOG]);

	// 			let logPathNode = pathNodes.find((child) => child.getType().get() == PM2_LOG_NODE_TYPE);
	// 			if (!logPathNode) logPathNode = await this._addLogRelationToPm2Process(processNode);

	// 			const pathModel = await logPathNode.getElement(true);
	// 			const logPath = processNode.info?.log?.out?.get();

	// 			if (!logPath || !pathModel) return resolve(null);

	// 			const processName = processNode.getName().get();

	// 			// fs.watchFile(logPath, (curr, prev) => {
	// 			// 	// no change
	// 			// 	if (curr.size == prev.size) return;

	// 			// 	const stream = fs.createReadStream(logPath, { encoding: "utf8" });
	// 			// 	console.log(`Watching log file: ${logPath}`);
	// 			// 	stream.on("data", (data) => debouncedUpdate(data));
	// 			// });

	// 			this._watchFile(processName, logPath, pathModel, resolve);
	// 		} catch (error) {
	// 			console.error(`Error syncing log for process node ${processNode.getName().get()}:`, error);
	// 			reject(error);
	// 		}
	// 	});
	// }

	// public async setupSystemMetricsAndPm2(hostName: string, systemMetrics: ISystemMetrics, pm2Instances: ProcessDescription[]) {
	// 	if (!this._graph) throw new Error("Graph is not initialized. Please set the graph before initializing services.");
	// 	this.vmContext = await this._initVmContext(this._graph, hostName);

	// 	// const promises = [this.updateSystemMetrics(systemMetrics), this._initPm2Processes(this.vmContext, pm2Instances)];

	// 	// return Promise.all(promises);

	// 	await this.updateSystemMetrics(systemMetrics, true);
	// 	await this._initPm2Processes(this.vmContext, pm2Instances);
	// }

	//////////////////////////////////////////////////
	// Private methods
	//////////////////////////////////////////////////

	// private _updatePm2Info(processNode: SpinalNode, pm2Process: ProcessDescription): { heapData: { heapSize: number; heapUsage: number; heapUsedSize: number }; memory: number; cpu: number } {
	// 	const pm2Env = pm2Process.pm2_env as { [key: string]: unknown } | undefined;

	// 	processNode.info.restarts.set(pm2Env?.restart_time); // Update the restart count
	// 	processNode.info.uptime.set(pm2Env?.pm_uptime); // Update the uptime

	// 	processNode.info.status.set(pm2Env?.status); // Update the status

	// 	const heapData = getHeapInfo(pm2Process);

	// 	processNode.info.heapMemory?.heapSize.set(heapData.heapSize); // Update the heap size
	// 	processNode.info.heapMemory?.heapUsage.set(heapData.heapUsage); // Update the heap usage
	// 	processNode.info.heapMemory?.heapUsedSize.set(heapData.heapUsedSize); // Update the heap used size

	// 	const { memory, cpu } = pm2Process.monit || {};
	// 	processNode.info.monit?.memory.set(memory); // Update the memory usage
	// 	processNode.info.monit?.cpu.set(cpu); // Update the CPU usage

	// 	return { heapData, memory, cpu } as { heapData: { heapSize: number; heapUsage: number; heapUsedSize: number }; memory: number; cpu: number };
	// }

	////////////////////////////////////////////////
	// PM2 Processes Management
	////////////////////////////////////////////////

	// private async _initPm2Processes(context: SpinalContext, pm2Instances: ProcessDescription[]): Promise<void> {
	// 	await this._watchAndSyncLogs();
	// 	console.log("PM2 processes initialized and updated successfully.");
	// }
}

export default GraphService;

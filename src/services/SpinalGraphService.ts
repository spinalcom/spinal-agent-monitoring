import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { _initLogPathInHub, getHeapInfo, HAS_LOG, HAS_PM2_PROCESS_RELATION_NAME, METRICS_ENDPOINTS, PM2_ENDPOINTS, PM2_LOG_NODE_TYPE, PM2_PROCESS_NODE_TYPE, uploadFileNewData, VM_CONTEXT_NODE_TYPE, waitUntil } from "../utils";
import { IPm2EventData, ISystemMetrics } from "../interfaces";
import { ProcessDescription } from "pm2";
import * as fs from "fs";
import * as lodash from "lodash";
import { EndpointUtils } from "./EndpointUtils";

const endpointUtils = EndpointUtils.getInstance();

export class SpinalGraphService {
	private static _instance: SpinalGraphService;
	private _graph: SpinalGraph | null = null;
	private vmContext: SpinalContext | null = null;
	private _logSyncked: Map<number, string> = new Map();

	public pm2Maps: Map<string | number, SpinalNode> = new Map();

	private constructor() {}

	public static getInstance(): SpinalGraphService {
		if (!this._instance) {
			this._instance = new SpinalGraphService();
		}
		return this._instance;
	}

	public setGraph(graph: SpinalGraph): void {
		this._graph = graph;
	}

	public getGraph(): SpinalGraph | null {
		return this._graph;
	}

	public getVmContext(): SpinalContext | null {
		return this.vmContext;
	}

	public getPm2NodeByKey(key: string | number): SpinalNode | undefined {
		for (const [mapKey, node] of this.pm2Maps.entries()) {
			const pm_id = node.info?.pm_id?.get();
			const name = node.getName().get();

			if (mapKey == key || pm_id == key || name == key) {
				return node;
			}
		}
	}

	public async setupSystemMetricsAndPm2(agentName: string, systemMetrics: ISystemMetrics, pm2Instances: ProcessDescription[]) {
		if (!this._graph) throw new Error("Graph is not initialized. Please set the graph before initializing services.");
		this.vmContext = await this._initVmContext(this._graph, agentName);

		const promises = [this.updateSystemMetrics(systemMetrics), this._initPm2Processes(this.vmContext, pm2Instances)];

		return Promise.all(promises);
	}

	public updateSystemMetrics(systemMetrics: ISystemMetrics) {
		if (!this.vmContext) throw new Error("VM Context is not initialized. Please initialize the VM context before updating system metrics.");

		for (const [key, value] of Object.entries(systemMetrics)) {
			if (this.vmContext.info[key]) this.vmContext.info[key].set(value);
			else this.vmContext.info.add_attr(key, value);
		}

		return endpointUtils.updateOrCreateMetricsEndpoints(this.vmContext, systemMetrics);
	}

	public async treatPm2Event(pm2Process: IPm2EventData) {
		const processKey = pm2Process.process.pm_id ?? pm2Process.process.name;

		let processFound = this.pm2Maps.get(processKey as number);

		if (!processFound) processFound = (await this._addPm2ProcessToGraph(pm2Process.process)) as SpinalNode;

		const eventType = pm2Process.event;

		const promises = [];

		const isErrorEvent = ["errored", "error"].includes(eventType);

		if (isErrorEvent) promises.push(endpointUtils._updateErroredEndpoint(processFound, 1));

		const value = ["stop", "exit", "errored", "error"].includes(eventType) ? 0 : 1;
		promises.push(endpointUtils._updateRebootEndpoint(processFound, value));

		return Promise.all(promises);
	}

	public async syncPm2Processes(pm2Processes: ProcessDescription[]) {
		if (!this.vmContext) throw new Error("VM Context is not initialized. Please initialize the VM context before updating PM2 processes.");
		const nodes = [];
		for (const pm2Process of pm2Processes) {
			let processAlreadyExist: SpinalNode | null = this.pm2Maps.get(pm2Process.pm_id as number) || this.pm2Maps.get(pm2Process.name as string) || null;

			if (!processAlreadyExist || processAlreadyExist.getName().get() !== pm2Process.name) {
				if (processAlreadyExist) await this.removePm2ProcessFromGraph(processAlreadyExist);

				// Add the new process to the graph and update the map
				processAlreadyExist = await this._addPm2ProcessToGraph(pm2Process);
				const key = pm2Process.pm_id ?? pm2Process.name;
				if (processAlreadyExist && key) this.pm2Maps.set(key, processAlreadyExist);
			}

			if (processAlreadyExist) nodes.push(processAlreadyExist);
		}

		const promises = nodes.map(async (node) => endpointUtils.updateOrCreatePm2ProcessEndpoints(node));
		return Promise.all(promises);
	}

	public updatePm2ProcessesMetrics(pm2Processes: ProcessDescription | ProcessDescription[]) {
		if (!Array.isArray(pm2Processes)) pm2Processes = [pm2Processes];
		const promises = [];

		for (const pm2Process of pm2Processes) {
			const processNode = this.pm2Maps.get(pm2Process.pm_id as number) || this.pm2Maps.get(pm2Process.name as string);
			if (!processNode) continue;

			// const { heapData, memory, cpu } = this._updateInfo(processNode, pm2Process);

			promises.push(endpointUtils.updateOrCreatePm2ProcessEndpoints(processNode));
		}

		return Promise.all(promises);
	}

	//////////////////////////////////////////////////
	// Private methods
	//////////////////////////////////////////////////

	private _updateInfo(processNode: SpinalNode, pm2Process: ProcessDescription): { heapData: { heapSize: number; heapUsage: number; heapUsedSize: number }; memory: number; cpu: number } {
		const pm2Env = pm2Process.pm2_env as { [key: string]: unknown } | undefined;

		processNode.info.restarts.set(pm2Env?.restart_time); // Update the restart count
		processNode.info.uptime.set(pm2Env?.pm_uptime); // Update the uptime

		processNode.info.status.set(pm2Env?.status); // Update the status

		const heapData = getHeapInfo(pm2Process);

		processNode.info.heapMemory?.heapSize.set(heapData.heapSize); // Update the heap size
		processNode.info.heapMemory?.heapUsage.set(heapData.heapUsage); // Update the heap usage
		processNode.info.heapMemory?.heapUsedSize.set(heapData.heapUsedSize); // Update the heap used size

		const { memory, cpu } = pm2Process.monit || {};
		processNode.info.monit?.memory.set(memory); // Update the memory usage
		processNode.info.monit?.cpu.set(cpu); // Update the CPU usage

		return { heapData, memory, cpu } as { heapData: { heapSize: number; heapUsage: number; heapUsedSize: number }; memory: number; cpu: number };
	}

	private async _initVmContext(graph: SpinalGraph, agentName: string): Promise<SpinalContext> {
		let existingNode = await graph.getContext(agentName);

		if (!existingNode || existingNode.getType().get() !== VM_CONTEXT_NODE_TYPE) {
			existingNode = new SpinalContext(agentName, VM_CONTEXT_NODE_TYPE);
			await graph.addContext(existingNode);
		}

		await waitUntil(() => typeof existingNode._server_id !== "undefined", 1000);

		return existingNode;
	}

	////////////////////////////////////////////////
	// PM2 Processes Management
	////////////////////////////////////////////////

	private async _initPm2Processes(context: SpinalContext, pm2Instances: ProcessDescription[]): Promise<void> {
		await this._initializeExistingPm2Processes(context);
		await this.syncPm2Processes(pm2Instances);
		await this.updatePm2ProcessesMetrics(pm2Instances);
		console.log("PM2 processes initialized and updated successfully.");
		// await this._watchAndSyncLogs();
	}

	private async _addPm2ProcessToGraph(pm2Process: ProcessDescription): Promise<SpinalNode | null> {
		if (!this.vmContext) return null;

		const existingNode = this.pm2Maps.get(pm2Process.pm_id as number) || this.pm2Maps.get(pm2Process.name as string);
		if (existingNode) return existingNode;

		const node = new SpinalNode(pm2Process.name, PM2_PROCESS_NODE_TYPE);
		// await waitUntil(() => typeof node._server_id !== "undefined", 1000);

		node.info.add_attr(this._buildPm2ProcessNodeInfo(pm2Process));

		if (pm2Process.pm_id) this.pm2Maps.set(pm2Process.pm_id, node);

		// await this._addLogRelationToPm2Process(node);

		return this.vmContext.addChildInContext(node, HAS_PM2_PROCESS_RELATION_NAME, SPINAL_RELATION_PTR_LST_TYPE, this.vmContext);
	}

	private async _initializeExistingPm2Processes(context: SpinalContext): Promise<void> {
		const existingProcesses = await context.getChildren(HAS_PM2_PROCESS_RELATION_NAME);

		for (const process of existingProcesses) {
			// const name = process.getName().get();
			const pm_id = process.info?.pm_id?.get() || process.info?.name?.get();

			if (pm_id) this.pm2Maps.set(pm_id, process);
		}
	}

	private async _addLogRelationToPm2Process(node: SpinalNode): Promise<SpinalNode> {
		const logPath = _initLogPathInHub(node.getName().get());

		const logNode = new SpinalNode(`${node.getName().get()}.log`, PM2_LOG_NODE_TYPE, logPath);

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

	private async _watchAndSyncLogs() {
		const promises = Array.from(this.pm2Maps.entries()).map(async ([key, processNode]) => {
			try {
				if (processNode.getName().get() == "spinal-core-hub-8010") return; // Skip if the node has a name, indicating it's already processed
				const dynamicId: number = processNode._server_id as number;
				if (this._logSyncked.has(dynamicId)) return;
				const logPath = await this._syncLogForProcess(processNode);
				if (logPath) this._logSyncked.set(dynamicId, logPath);
			} catch (error) {
				console.error(`Error processing PM2 process node for key ${key}:`, error);
			}
		});

		return Promise.all(promises);
	}

	private async _syncLogForProcess(processNode: SpinalNode): Promise<string | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const pathNodes = await processNode.getChildren([HAS_LOG]);

				let logPathNode = pathNodes.find((child) => child.getType().get() === PM2_LOG_NODE_TYPE);
				if (!logPathNode) logPathNode = await this._addLogRelationToPm2Process(processNode);

				const pathModel = await logPathNode.getElement(true);
				const logPath = processNode.info?.log?.out?.get();

				if (!logPath || !pathModel) return resolve(null);

				const processName = processNode.getName().get();

				const debouncedUpdate = lodash.debounce(async (newData) => {
					const isUploaded = await uploadFileNewData(pathModel, newData);
					const message = isUploaded ? `${processName} Log data uploaded successfully` : `Failed to upload ${processName} log data`;
					console.log(message);
				}, 5000);

				fs.watchFile(logPath, (curr, prev) => {
					const stream = fs.createReadStream(logPath, { encoding: "utf8" });
					stream.on("data", (data) => debouncedUpdate(data));
				});

				resolve(logPath);
			} catch (error) {
				reject(error);
			}
		});
	}

	private removePm2ProcessFromGraph(processNode: SpinalNode) {
		return processNode.removeFromGraph().then(async () => {
			const name = processNode.getName().get();
			const pm_id = processNode.info?.pm_id?.get();

			if (name) this.pm2Maps.delete(name);
			if (pm_id) this.pm2Maps.delete(pm_id);

			await processNode.removeRelation(HAS_LOG, SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
				const pathWatched = this._logSyncked.get(processNode._server_id as number);

				if (pathWatched) {
					fs.unwatchFile(pathWatched);
					this._logSyncked.delete(processNode._server_id as number);
				}

				return result;
			});
		});
	}

	///////////////////////////////////////////////////////////////
	//			Endpoint for PM2 Processes Management
	///////////////////////////////////////////////////////////////
}

export default SpinalGraphService;

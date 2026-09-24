import os from "os";
import { FileSystem, spinalCore, Lst } from "spinal-core-connectorjs";
import { SpinalGraph } from "spinal-model-graph";
import { SpinalCommand } from "../models";
import { SPINAL_COMMAND_STATUS, waitUntil } from "../../utils";
export default class ConfigFileService {
	private static _instance: ConfigFileService;
	private _graph: SpinalGraph | null = null;
	private readonly DEFAULT_CONFIG_FILE_PATH = "/etc/Organs/Monitoring/VM_MONITORING_CONFIG";

	private constructor() {}

	public static getInstance(): ConfigFileService {
		if (!this._instance) {
			this._instance = new ConfigFileService();
		}
		return this._instance;
	}

	public async initializeConfigFile(spinalConnection: FileSystem, configFilePath: string = this.DEFAULT_CONFIG_FILE_PATH): Promise<SpinalGraph> {
		const graph = await this._loadOrMakeConfigFile(spinalConnection, configFilePath);
		this._graph = graph;
		return graph;
	}

	private _loadOrMakeConfigFile(spinalConnection: FileSystem, filePath: string): Promise<SpinalGraph> {
		return new Promise((resolve, reject) => {
			spinalCore.load(
				spinalConnection,
				filePath,
				async (graph: SpinalGraph) => {
					resolve(graph);
				}, // Success callback
				() => this._errorCallback(spinalConnection, filePath, resolve, reject), // error callback
			);
		});
	}

	private _errorCallback(connection: FileSystem, filePath: string, resolve: (value: SpinalGraph) => void, reject: (reason?: any) => void) {
		try {
			const graph = new SpinalGraph();

			spinalCore.store(
				connection,
				graph,
				filePath,
				async () => {
					await waitUntil(() => typeof graph._server_id !== "undefined", 500);
					resolve(graph);
				},
				() => reject(new Error(`Failed to create or load the config file at ${filePath}`)),
			);
		} catch (error) {
			reject(error);
		}
	}
}

export { ConfigFileService };

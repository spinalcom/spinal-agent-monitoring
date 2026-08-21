import os from "os";
import { FileSystem, spinalCore, Lst } from "spinal-core-connectorjs";
import { SpinalGraph } from "spinal-model-graph";
import { SpinalCommand } from "../models";
import { SPINAL_COMMAND_STATUS, waitUntil } from "../utils";
export default class ConfigFileService {
	private static _instance: ConfigFileService;
	private _graph: SpinalGraph | null = null;
	private commandExecuted = new Set<string>();

	private constructor() {}

	public static getInstance(): ConfigFileService {
		if (!this._instance) {
			this._instance = new ConfigFileService();
		}
		return this._instance;
	}

	// public async initializeConfigFile(spinalConnection: FileSystem, organName?: string): Promise<SpinalGraph> {
	public async initializeConfigFile(spinalConnection: FileSystem): Promise<SpinalGraph> {
		// organName = organName || os.hostname();
		// const configFileName = `${organName}`;
		const configFileName = `Monitoring config file`;

		const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
		const graph = await this._loadOrMakeConfigFile(spinalConnection, configFilePath);
		// await this.initAndBindCommandList();

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

	/*
		private async initAndBindCommandList() {
		const commandList = this._initCommandList(this._graph);

		commandList.bind(async () => {
			for (let i = 0; i < commandList.length; i++) {
				const command = commandList[i];
				await this._executeCommand(command).finally(() => {
					this.commandExecuted.add(command.id.get());
					commandList.remove(command);
				});
			}
		});
	}

	private _initCommandList(graph: SpinalGraph | null): Lst<SpinalCommand> {
		if (!graph) throw new Error("Graph is not initialized. Please call initializeConfigFile first.");

		if (typeof graph.info?.commandList === "undefined") {
			graph.info.add_attr({ commandList: new Lst<SpinalCommand>([]) });
		}

		return graph.info.commandList;
	}

	private _executeCommand(command: SpinalCommand): Promise<boolean> {
		// Check if the command is available before executing
		if (!command.isAvailable()) return Promise.resolve(false);

		// Check if the command has already been executed to avoid duplicate execution
		if (this.commandExecuted.has(command.id.get())) return Promise.resolve(false);

		return command
			.execute()
			.then(() => {
				command.status.set(SPINAL_COMMAND_STATUS.completed);
				return true;
			})
			.catch((error) => {
				command.status.set(SPINAL_COMMAND_STATUS.failed);
				return false;
			});
	}
	
	*/
}

export { ConfigFileService };

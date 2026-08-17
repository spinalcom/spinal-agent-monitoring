import os from "os";
import { FileSystem, spinalCore, SpinalCallBackError, Directory, Lst } from "spinal-core-connectorjs";
import path from "path";
import ConfigFileModel from "../models/ConfigFileModel";
import { ISystemMetrics } from "../interfaces/interfaces";
import { Pm2Service } from "./Pm2Service";
import { Pm2Process } from "../models/Pm2Process";
import { SpinalGraph } from "spinal-model-graph";
import SystemOverviewService from "./SystemOverviewService";
import { SpinalCommand } from "../models";
import { SPINAL_COMMAND_STATUS } from "../utils";
import { privateDecrypt } from "crypto";

export default class ConfigFileService {
	private static _instance: ConfigFileService;
	private configFileModel: ConfigFileModel | null = null;
	private pm2_processes: Lst<Pm2Process> | undefined;
	private _graph: SpinalGraph | null = null;
	private commandExecuted = new Set<string>();

	private constructor() {}

	public static getInstance(): ConfigFileService {
		if (!this._instance) {
			this._instance = new ConfigFileService();
		}
		return this._instance;
	}

	public async initializeConfigFile(spinalConnection: FileSystem, organName?: string): Promise<SpinalGraph> {
		organName = organName || os.hostname();
		// const configFileName = `VM_MONITORING_${organName}`;
		const configFileName = `${organName}`;

		const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
		this._graph = await this._loadOrMakeConfigFile(spinalConnection, configFilePath);
		await this.initAndBindCommandList();

		return this._graph;
	}

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

	private _loadOrMakeConfigFile(spinalConnection: FileSystem, filePath: string): Promise<SpinalGraph> {
		return new Promise((resolve, reject) => {
			spinalCore.load(
				spinalConnection,
				filePath,
				(graph: SpinalGraph) => resolve(graph), // Success callback
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
				() => resolve(graph),
				() => reject(new Error(`Failed to create or load the config file at ${filePath}`)),
			);
			// const directory = path.dirname(filePath);
			// const fileName = path.basename(filePath);
			// connection.load_or_make_dir(directory, (dir: Directory) => {
			// 	const file = new ConfigFileModel(organName, organType, os.hostname(), systemInfo);
			// 	dir.force_add_file(fileName, file, { model_type: "ConfigFile" });
			// 	resolve(file);
			// });
		} catch (error) {
			reject(error);
		}
	}
}

export { ConfigFileService };

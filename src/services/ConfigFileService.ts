import os from "os";
import { FileSystem, spinalCore, SpinalCallBackError, Directory, Lst } from "spinal-core-connectorjs";
import path from "path";
import ConfigFileModel from "../models/ConfigFileModel";
import { ISystemMetrics } from "../interfaces/interfaces";
import { Pm2Service } from "./Pm2Service";
import { Pm2Process } from "../models/Pm2Process";

export default class ConfigFileService {
	private static _instance: ConfigFileService;
	private configFileModel: ConfigFileModel | null = null;
	private pm2_processes: Lst<Pm2Process> | undefined;

	private constructor() {}

	public static getInstance(): ConfigFileService {
		if (!this._instance) {
			this._instance = new ConfigFileService();
		}
		return this._instance;
	}

	public async initializeConfigFile(spinalConnection: FileSystem, systemInfo: ISystemMetrics, organName?: string): Promise<ConfigFileModel> {
		organName = organName || os.hostname();
		// const configFileName = `VM_MONITORING_${organName}`;
		const configFileName = `${organName}`;

		const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
		const configFile = await this._loadOrMakeConfigFile(spinalConnection, configFilePath, organName, "Monitoring", systemInfo);

		await configFile.initialize(organName, "Monitoring", os.hostname(), systemInfo);
		this.configFileModel = configFile;

		// Refresh PM2 processes after initializing the config file
		await this.updatePm2List();

		// Bind the command list to listen for new commands
		configFile.bindCommandList();

		return this.configFileModel;
	}

	public async updatePm2List() {
		const processes = await Pm2Service.getInstance().getAllPm2Processes();

		this.pm2_processes = await this.configFileModel?.updatePm2Processes(processes);
		return this.pm2_processes;
	}

	public refreshSystemMetrics(systemInfo: ISystemMetrics) {
		if (this.configFileModel) this.configFileModel.updateMetrics(systemInfo);
	}

	public async refreshPm2Metrics() {
		if (this.configFileModel) await this.configFileModel.updatePm2Metrics();
	}

	private _loadOrMakeConfigFile(spinalConnection: FileSystem, filePath: string, organName: string, organType: string, systemInfo: ISystemMetrics): Promise<ConfigFileModel> {
		return new Promise((resolve, reject) => {
			spinalCore.load(
				spinalConnection,
				filePath,
				(model: ConfigFileModel) => {
					model.updateMetrics(systemInfo);
					resolve(model);
				},
				() => this._errorCallback(spinalConnection, filePath, organName, organType, systemInfo, resolve, reject),
			);
		});
	}

	private _errorCallback(connection: FileSystem, filePath: string, organName: string, organType: string, systemInfo: ISystemMetrics, resolve: (value: ConfigFileModel) => void, reject: (reason?: any) => void) {
		try {
			const directory = path.dirname(filePath);
			const fileName = path.basename(filePath);
			connection.load_or_make_dir(directory, (dir: Directory) => {
				const file = new ConfigFileModel(organName, organType, os.hostname(), systemInfo);
				dir.force_add_file(fileName, file, { model_type: "ConfigFile" });
				resolve(file);
			});
		} catch (error) {
			reject(error);
		}
	}
}

export { ConfigFileService };

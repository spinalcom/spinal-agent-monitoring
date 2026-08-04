import { Lst, Model, spinalCore, Ptr } from "spinal-core-connectorjs";
import { getDefaultSystemMetrics } from "../utils/systemUtils";
import * as os from "os";
import { IControlAction, ILog, IPM2Process, ISystemMetrics } from "../interfaces/interfaces";
import { ProcessDescription } from "pm2";
import Pm2Process from "./Pm2Process";
import { waitUntil } from "../utils/pm2Utils";
import { SpinalCommand } from "./SpinalCommand";
import { SPINAL_COMMAND_STATUS } from "../utils/constants";

export default class ConfigFileModel extends Model {
	public static FILE_TYPE = "AgentMonitoring";
	public pm2List: Pm2Process[] = [];

	constructor(name?: string, type?: string, serverName?: string, systemInfo?: ISystemMetrics) {
		super();
		this.add_attr({
			type: ConfigFileModel.FILE_TYPE,
			fileType: ConfigFileModel.FILE_TYPE,
			lastUpdate: Date.now(),
			systemOverView: this._getDefaultHostInfoData(name, type, serverName, systemInfo),
			pm2Processes: new Ptr(new Lst([])),
			commandList: new Lst<SpinalCommand>([]),
		});
	}

	initialize(name?: string, type?: string, serverName?: string, systemInfo?: ISystemMetrics) {
		this._checkAttributesExistence("type", ConfigFileModel.FILE_TYPE);
		this._checkAttributesExistence("fileType", ConfigFileModel.FILE_TYPE);
		this._checkAttributesExistence("lastUpdate", Date.now());
		this._checkAttributesExistence("systemOverView", this._getDefaultHostInfoData(name, type, serverName, systemInfo));
		this._checkAttributesExistence("pm2Processes", new Ptr(new Lst([])));
		this._checkAttributesExistence("commandList", new Lst<SpinalCommand>([]));
	}

	public updateMetrics(systemInfo: ISystemMetrics) {
		for (const key in systemInfo) {
			if (this.systemOverView[key] && typeof this.systemOverView[key].set === "function") {
				const value = systemInfo[key as keyof ISystemMetrics];
				this.systemOverView[key].set(value);
			}
		}

		this.systemOverView.lastHealthTime.set(Date.now());
		this.lastUpdate.set(Date.now());
	}

	public async updatePm2Metrics() {
		if (!this.pm2List || this.pm2List.length === 0) return;

		const promises = this.pm2List.map(async (pm2Process) => pm2Process.refreshMetrics());
		await Promise.all(promises);
	}

	public async updatePm2Processes(processes: ProcessDescription[]): Promise<Lst<Pm2Process>> {
		const pm2ProcessesLst = await this.getPm2Processes();
		await pm2ProcessesLst.clear();

		for (const process of processes) {
			const pm2ProcessModel = new Pm2Process(process);
			pm2ProcessesLst.push(pm2ProcessModel);
		}
		this.lastUpdate.set(Date.now());
		this.pm2List = Array.from(pm2ProcessesLst);
		return pm2ProcessesLst;
	}

	public async getPm2Processes(): Promise<Lst<Pm2Process>> {
		const processes = await this.pm2Processes.load();
		return processes;
	}

	public async getPm2ProcessById(key: string | number): Promise<Pm2Process | undefined> {
		const processesLst = await this.getPm2Processes();
		for (let i = 0; i < processesLst.length; i++) {
			const process = processesLst[i];
			if (process.pm_id.get() == key || process.pid.get() == key || process.name.get() == key) {
				return process;
			}
		}
	}

	public async addCommand(command: SpinalCommand): Promise<void> {
		this.commandList.push(command);
		this.lastUpdate.set(Date.now());
	}

	public bindCommandList(): void {
		const commandExecuted = new Set<string>();

		this.commandList.bind(async () => {
			for (let i = 0; i < this.commandList.length; i++) {
				const command = this.commandList[i];
				if (command.status.get() == SPINAL_COMMAND_STATUS.pending && !commandExecuted.has(command.id.get())) {
					commandExecuted.add(command.id.get());
					await this._executeCommand(command);
				}
			}
		});
	}

	private _getDefaultHostInfoData(name?: string, type?: string, serverName?: string, systemInfo?: ISystemMetrics) {
		return {
			id: Date.now().toString(),
			name: name || "VM Monitoring Agent",
			type: type || "Monitoring",
			bootTimestamp: Date.now(),
			lastHealthTime: Date.now(),
			...(systemInfo || getDefaultSystemMetrics()),
			serverName: serverName || os.hostname(),
		};
	}

	private _executeCommand(command: SpinalCommand): Promise<boolean> {
		return command
			.execute()
			.then(() => {
				command.status.set(SPINAL_COMMAND_STATUS.completed);
				return true;
			})
			.catch((error) => {
				command.status.set(SPINAL_COMMAND_STATUS.failed);
				return false;
			})
			.finally(() => {
				this.commandList.remove(command);
			});
	}

	private _checkAttributesExistence(attributeName: string, value: any, editIt: boolean = false): void {
		if (typeof this[attributeName] === "undefined") this.add_attr({ [attributeName]: value });
		else if (this[attributeName] && editIt) this.mod_attr(attributeName, value);
	}
}

spinalCore.register_models(ConfigFileModel, "ConfigFile");
export { ConfigFileModel };

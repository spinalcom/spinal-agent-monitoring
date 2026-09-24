import { set } from "lodash";
import { FileSystem, spinalCore } from "spinal-core-connectorjs";
import type { SpinalGraph } from "spinal-model-graph";
import { connect } from "tls";
import ConfigFileService from "./ConfigFileService";

export default class SpinalhubService {
	private static _instance: SpinalhubService;
	private conn: FileSystem | null = null;
	private _graph: SpinalGraph | null = null;

	private constructor() {
		FileSystem.onConnectionError = (code_error: number) => {
			console.error("Spinalhub connection error:", code_error);
		};
	}

	public static getInstance(): SpinalhubService {
		if (!this._instance) {
			this._instance = new SpinalhubService();
		}
		return this._instance;
	}

	public setConnection(conn: FileSystem) {
		this.conn = conn;
	}

	public getConnection(): FileSystem | null {
		return this.conn;
	}

	public getGraph(): SpinalGraph | null {
		if (!this._graph) {
			throw new Error("Monitoring Graph is not initialized.");
		}
		return this._graph;
	}

	public async initializeConfigFile(configFilePath: string = "/etc/Organs/Monitoring/DEFAULT_VM_MONITORING_CONFIG") {
		if (!this.conn) {
			throw new Error("No connection to Spinalhub. Please set the connection first.");
		}

		const graph = await ConfigFileService.getInstance().initializeConfigFile(this.conn, configFilePath);
		this._graph = graph;
		return graph;
	}

	// public createConfigFile() {
	// 	const organName = this.agentInfo.organName || os.hostname();
	// 	const configFileName = `VM_MONITORING_${organName}`;
	// 	const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
	// }
}

export { SpinalhubService };

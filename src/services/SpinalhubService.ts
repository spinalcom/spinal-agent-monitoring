import { FileSystem, spinalCore } from "spinal-core-connectorjs";

export default class SpinalhubService {
	private static _instance: SpinalhubService;
	public readonly spinalConnectorInfo = {
		protocol: process.env.SPINALHUB_PROTOCOL, // user id
		user: process.env.SPINAL_USER_ID, // user id
		password: process.env.SPINAL_PASSWORD, // user password
		host: process.env.SPINALHUB_IP, // can be an ip address
		port: process.env.SPINALHUB_PORT,
	};

	private conn: FileSystem | null = null;

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

	public connect(): FileSystem | null {
		return this.connectToSpinalhub();
	}

	public getConnectString(): string | null {
		const { protocol, user, password, host, port } = this.spinalConnectorInfo;
		if (!protocol || !user || !password || !host) {
			return null;
		}

		let connect_opt = `${protocol}://${user}:${password}@${host}`;
		if (port) connect_opt += `:${port}`;
		return connect_opt;
	}

	public getConnection(): FileSystem | null {
		return this.conn;
	}

	public connectToSpinalhub(): FileSystem | null {
		let connect_opt = this.getConnectString();
		if (!connect_opt) {
			throw new Error("Missing configuration for Spinalhub connection. Please check your environment variables.");
		}

		this.conn = spinalCore.connect(connect_opt);
		return this.conn;
	}

	// public createConfigFile() {
	// 	const organName = this.agentInfo.organName || os.hostname();
	// 	const configFileName = `VM_MONITORING_${organName}`;
	// 	const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
	// }
}

export { SpinalhubService };

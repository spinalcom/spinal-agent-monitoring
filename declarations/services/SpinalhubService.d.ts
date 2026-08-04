import config from "../utils/config";
import { FileSystem } from "spinal-core-connectorjs";
export default class SpinalhubService {
    private static _instance;
    readonly spinalConnectorInfo: typeof config.spinalConnector;
    private conn;
    private constructor();
    static getInstance(): SpinalhubService;
    connect(): FileSystem | null;
    getConnectString(): string | null;
    getConnection(): FileSystem | null;
    connectToSpinalhub(): FileSystem | null;
}
export { SpinalhubService };

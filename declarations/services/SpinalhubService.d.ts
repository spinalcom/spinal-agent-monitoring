import { FileSystem } from "spinal-core-connectorjs";
export default class SpinalhubService {
    private static _instance;
    readonly spinalConnectorInfo: {
        protocol: string | undefined;
        user: string | undefined;
        password: string | undefined;
        host: string | undefined;
        port: string | undefined;
    };
    private conn;
    private constructor();
    static getInstance(): SpinalhubService;
    connect(): FileSystem | null;
    getConnectString(): string | null;
    getConnection(): FileSystem | null;
    connectToSpinalhub(): FileSystem | null;
}
export { SpinalhubService };

import { FileSystem } from "spinal-core-connectorjs";
import type { SpinalGraph } from "spinal-model-graph";
export default class SpinalhubService {
    private static _instance;
    private conn;
    private _graph;
    private constructor();
    static getInstance(): SpinalhubService;
    setConnection(conn: FileSystem): void;
    getConnection(): FileSystem | null;
    getGraph(): SpinalGraph | null;
    initializeConfigFile(configFilePath?: string): Promise<SpinalGraph<any>>;
}
export { SpinalhubService };

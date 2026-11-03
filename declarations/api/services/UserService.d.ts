import { SpinalGraph } from "spinal-model-graph";
interface GraphProvider {
    getGraph(): SpinalGraph | null;
}
export default class UserService {
    private readonly credentialsPath;
    private readonly environmentPath;
    private static _instance;
    private graphService?;
    private usersContext;
    private jwtSecret;
    private readonly tokenLifetimeMs;
    constructor(graphService?: GraphProvider, credentialsPath?: string, environmentPath?: string);
    static getInstance(): UserService;
    initialize(): Promise<void>;
    login(username: string, password: string): Promise<{
        token: string;
        expiresIn: number;
    } | null>;
    isTokenValid(token: string): boolean;
    private _getOrCreateUsersContext;
    private _createAdminUser;
    private _readJwtSecret;
    private _persistJwtSecret;
    private _assertValidPasswordRecord;
    private _writeAdminPassword;
    private _getGraphService;
}
export {};

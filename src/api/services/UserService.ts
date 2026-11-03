import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "fs";
import { parse as parseDotenv } from "dotenv";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import path from "path";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { waitUntil } from "../../utils/pm2Utils";

const USERS_CONTEXT_NAME = "users";
const USERS_CONTEXT_TYPE = "Users";
const USER_NODE_TYPE = "User";
const HAS_USERS_RELATION_NAME = "hasUsers";
const ADMIN_USERNAME = "admin";
const JWT_ISSUER = "spinal-agent-monitoring";
const JWT_AUDIENCE = "spinal-agent-monitoring-api";

interface GraphProvider {
	getGraph(): SpinalGraph | null;
}

export default class UserService {
	private static _instance: UserService;
	private graphService?: GraphProvider;
	private usersContext: SpinalContext | null = null;
	private jwtSecret: string | null = null;
	private readonly tokenLifetimeMs = 8 * 60 * 60 * 1000;

	constructor(
		graphService?: GraphProvider,
		private readonly credentialsPath: string = path.resolve(process.cwd(), ".admin.log"),
		private readonly environmentPath: string = path.resolve(__dirname, "../../../.env"),
	) {
		this.graphService = graphService;
	}

	static getInstance(): UserService {
		if (!this._instance) {
			this._instance = new UserService();
		}
		return this._instance;
	}

	public async initialize(): Promise<void> {
		this.jwtSecret = this._readJwtSecret();
		const graph = (this.graphService || this._getGraphService()).getGraph();
		if (!graph) {
			throw new Error("Cannot initialize users because the monitoring graph is unavailable");
		}

		this.usersContext = await this._getOrCreateUsersContext(graph);
		const adminNodes = (await this.usersContext.getChildren(HAS_USERS_RELATION_NAME)).filter((node) => node.info?.username?.get() === ADMIN_USERNAME);
		if (adminNodes.length > 1) {
			throw new Error("Multiple admin users exist in the users context");
		}

		if (adminNodes.length === 0) {
			await this._createAdminUser(this.usersContext);
		} else {
			this._assertValidPasswordRecord(adminNodes[0]);
		}
	}

	public async login(username: string, password: string): Promise<{ token: string; expiresIn: number } | null> {
		if (!this.usersContext) {
			throw new Error("UserService must be initialized before login");
		}
		if (username !== ADMIN_USERNAME) {
			return null;
		}

		const adminNode = (await this.usersContext.getChildren(HAS_USERS_RELATION_NAME)).find((node) => node.info?.username?.get() === ADMIN_USERNAME);
		if (!adminNode) {
			throw new Error("Admin user is missing from the users context");
		}

		const { passwordSalt, passwordHash } = this._assertValidPasswordRecord(adminNode);
		const candidateHash = scryptSync(password, passwordSalt, 64);
		const expectedHash = Buffer.from(passwordHash, "hex");
		if (!timingSafeEqual(candidateHash, expectedHash)) {
			return null;
		}

		if (!this.jwtSecret) {
			throw new Error("JWT signing secret is unavailable");
		}

		const token = jwt.sign({ sub: ADMIN_USERNAME }, this.jwtSecret, {
			algorithm: "HS256",
			audience: JWT_AUDIENCE,
			expiresIn: this.tokenLifetimeMs / 1000,
			issuer: JWT_ISSUER,
		});
		return { token, expiresIn: this.tokenLifetimeMs / 1000 };
	}

	public isTokenValid(token: string): boolean {
		if (!this.jwtSecret) {
			return false;
		}

		try {
			const payload = jwt.verify(token, this.jwtSecret, {
				algorithms: ["HS256"],
				audience: JWT_AUDIENCE,
				issuer: JWT_ISSUER,
			});
			return typeof payload !== "string" && payload.sub === ADMIN_USERNAME;
		} catch (error) {
			if (error instanceof JsonWebTokenError) {
				return false;
			}
			throw error;
		}
	}

	private async _getOrCreateUsersContext(graph: SpinalGraph): Promise<SpinalContext> {
		const existingContext = await graph.getContext(USERS_CONTEXT_NAME);
		if (existingContext) {
			if (existingContext.getType().get() !== USERS_CONTEXT_TYPE) {
				throw new Error(`The graph context '${USERS_CONTEXT_NAME}' has an unexpected type`);
			}
			return existingContext;
		}

		const usersContext = new SpinalContext(USERS_CONTEXT_NAME, USERS_CONTEXT_TYPE);
		await graph.addContext(usersContext);
		await waitUntil(() => typeof usersContext._server_id !== "undefined", 1000);
		return usersContext;
	}

	private async _createAdminUser(usersContext: SpinalContext): Promise<void> {
		const password = randomBytes(32).toString("base64url");
		const passwordSalt = randomBytes(16).toString("hex");
		const passwordHash = scryptSync(password, passwordSalt, 64).toString("hex");
		const adminNode = new SpinalNode(ADMIN_USERNAME, USER_NODE_TYPE);

		adminNode.info.add_attr({
			username: ADMIN_USERNAME,
			passwordSalt,
			passwordHash,
		});

		this._writeAdminPassword(password);
		await usersContext.addChildInContext(adminNode, HAS_USERS_RELATION_NAME, SPINAL_RELATION_PTR_LST_TYPE, usersContext);
		await waitUntil(() => typeof adminNode._server_id !== "undefined", 1000);
	}

	private _readJwtSecret(): string {
		let jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			const envContents = existsSync(this.environmentPath) ? readFileSync(this.environmentPath, "utf8") : "";
			jwtSecret = parseDotenv(envContents).JWT_SECRET;
			if (jwtSecret) {
				process.env.JWT_SECRET = jwtSecret;
			} else {
				jwtSecret = randomBytes(64).toString("hex");
				this._persistJwtSecret(jwtSecret, envContents);
				process.env.JWT_SECRET = jwtSecret;
			}
		}

		if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
			throw new Error("JWT_SECRET must be configured with at least 32 bytes");
		}
		return jwtSecret;
	}

	private _persistJwtSecret(jwtSecret: string, envContents: string): void {
		const lineEnding = envContents.includes("\r\n") ? "\r\n" : "\n";
		const jwtSecretLine = /^[ \t]*(?:export[ \t]+)?JWT_SECRET[ \t]*=[^\r\n]*(?:\r?\n|$)/m;
		let updatedContents: string;

		if (jwtSecretLine.test(envContents)) {
			updatedContents = envContents.replace(jwtSecretLine, `JWT_SECRET=${jwtSecret}${lineEnding}`);
		} else {
			const separator = envContents.length > 0 && !/[\r\n]$/.test(envContents) ? lineEnding : "";
			updatedContents = `${envContents}${separator}JWT_SECRET=${jwtSecret}${lineEnding}`;
		}

		writeFileSync(this.environmentPath, updatedContents, { encoding: "utf8", mode: 0o600 });
	}

	private _assertValidPasswordRecord(node: SpinalNode): { passwordSalt: string; passwordHash: string } {
		const passwordSalt = node.info?.passwordSalt?.get();
		const passwordHash = node.info?.passwordHash?.get();
		if (typeof passwordSalt !== "string" || passwordSalt.length === 0 || typeof passwordHash !== "string" || !/^[a-f0-9]{128}$/i.test(passwordHash)) {
			throw new Error("Admin user has invalid password data in the users graph context");
		}
		return { passwordSalt, passwordHash };
	}

	private _writeAdminPassword(password: string): void {
		const credentials = JSON.stringify({ username: ADMIN_USERNAME, password }, null, 2);
		writeFileSync(this.credentialsPath, credentials, { encoding: "utf8", mode: 0o600 });
		chmodSync(this.credentialsPath, 0o600);
	}

	private _getGraphService(): GraphProvider {
		const { GraphService } = require("./GraphService") as { GraphService: { getInstance(): GraphProvider } };
		const graphService = GraphService.getInstance();
		this.graphService = graphService;
		return graphService;
	}
}

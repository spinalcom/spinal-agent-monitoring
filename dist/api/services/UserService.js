"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const spinal_model_graph_1 = require("spinal-model-graph");
const pm2Utils_1 = require("../../utils/pm2Utils");
const USERS_CONTEXT_NAME = "users";
const USERS_CONTEXT_TYPE = "Users";
const USER_NODE_TYPE = "User";
const HAS_USERS_RELATION_NAME = "hasUsers";
const ADMIN_USERNAME = "admin";
const JWT_ISSUER = "spinal-agent-monitoring";
const JWT_AUDIENCE = "spinal-agent-monitoring-api";
class UserService {
    constructor(graphService, credentialsPath = path_1.default.resolve(process.cwd(), ".admin.log"), environmentPath = path_1.default.resolve(__dirname, "../../../.env")) {
        this.credentialsPath = credentialsPath;
        this.environmentPath = environmentPath;
        this.usersContext = null;
        this.jwtSecret = null;
        this.tokenLifetimeMs = 8 * 60 * 60 * 1000;
        this.graphService = graphService;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new UserService();
        }
        return this._instance;
    }
    async initialize() {
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
        }
        else {
            this._assertValidPasswordRecord(adminNodes[0]);
        }
    }
    async login(username, password) {
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
        const candidateHash = (0, crypto_1.scryptSync)(password, passwordSalt, 64);
        const expectedHash = Buffer.from(passwordHash, "hex");
        if (!(0, crypto_1.timingSafeEqual)(candidateHash, expectedHash)) {
            return null;
        }
        if (!this.jwtSecret) {
            throw new Error("JWT signing secret is unavailable");
        }
        const token = jsonwebtoken_1.default.sign({ sub: ADMIN_USERNAME }, this.jwtSecret, {
            algorithm: "HS256",
            audience: JWT_AUDIENCE,
            expiresIn: this.tokenLifetimeMs / 1000,
            issuer: JWT_ISSUER,
        });
        return { token, expiresIn: this.tokenLifetimeMs / 1000 };
    }
    isTokenValid(token) {
        if (!this.jwtSecret) {
            return false;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.jwtSecret, {
                algorithms: ["HS256"],
                audience: JWT_AUDIENCE,
                issuer: JWT_ISSUER,
            });
            return typeof payload !== "string" && payload.sub === ADMIN_USERNAME;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                return false;
            }
            throw error;
        }
    }
    async _getOrCreateUsersContext(graph) {
        const existingContext = await graph.getContext(USERS_CONTEXT_NAME);
        if (existingContext) {
            if (existingContext.getType().get() !== USERS_CONTEXT_TYPE) {
                throw new Error(`The graph context '${USERS_CONTEXT_NAME}' has an unexpected type`);
            }
            return existingContext;
        }
        const usersContext = new spinal_model_graph_1.SpinalContext(USERS_CONTEXT_NAME, USERS_CONTEXT_TYPE);
        await graph.addContext(usersContext);
        await (0, pm2Utils_1.waitUntil)(() => typeof usersContext._server_id !== "undefined", 1000);
        return usersContext;
    }
    async _createAdminUser(usersContext) {
        const password = (0, crypto_1.randomBytes)(32).toString("base64url");
        const passwordSalt = (0, crypto_1.randomBytes)(16).toString("hex");
        const passwordHash = (0, crypto_1.scryptSync)(password, passwordSalt, 64).toString("hex");
        const adminNode = new spinal_model_graph_1.SpinalNode(ADMIN_USERNAME, USER_NODE_TYPE);
        adminNode.info.add_attr({
            username: ADMIN_USERNAME,
            passwordSalt,
            passwordHash,
        });
        this._writeAdminPassword(password);
        await usersContext.addChildInContext(adminNode, HAS_USERS_RELATION_NAME, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, usersContext);
        await (0, pm2Utils_1.waitUntil)(() => typeof adminNode._server_id !== "undefined", 1000);
    }
    _readJwtSecret() {
        let jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            const envContents = (0, fs_1.existsSync)(this.environmentPath) ? (0, fs_1.readFileSync)(this.environmentPath, "utf8") : "";
            jwtSecret = (0, dotenv_1.parse)(envContents).JWT_SECRET;
            if (jwtSecret) {
                process.env.JWT_SECRET = jwtSecret;
            }
            else {
                jwtSecret = (0, crypto_1.randomBytes)(64).toString("hex");
                this._persistJwtSecret(jwtSecret, envContents);
                process.env.JWT_SECRET = jwtSecret;
            }
        }
        if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
            throw new Error("JWT_SECRET must be configured with at least 32 bytes");
        }
        return jwtSecret;
    }
    _persistJwtSecret(jwtSecret, envContents) {
        const lineEnding = envContents.includes("\r\n") ? "\r\n" : "\n";
        const jwtSecretLine = /^[ \t]*(?:export[ \t]+)?JWT_SECRET[ \t]*=[^\r\n]*(?:\r?\n|$)/m;
        let updatedContents;
        if (jwtSecretLine.test(envContents)) {
            updatedContents = envContents.replace(jwtSecretLine, `JWT_SECRET=${jwtSecret}${lineEnding}`);
        }
        else {
            const separator = envContents.length > 0 && !/[\r\n]$/.test(envContents) ? lineEnding : "";
            updatedContents = `${envContents}${separator}JWT_SECRET=${jwtSecret}${lineEnding}`;
        }
        (0, fs_1.writeFileSync)(this.environmentPath, updatedContents, { encoding: "utf8", mode: 0o600 });
    }
    _assertValidPasswordRecord(node) {
        const passwordSalt = node.info?.passwordSalt?.get();
        const passwordHash = node.info?.passwordHash?.get();
        if (typeof passwordSalt !== "string" || passwordSalt.length === 0 || typeof passwordHash !== "string" || !/^[a-f0-9]{128}$/i.test(passwordHash)) {
            throw new Error("Admin user has invalid password data in the users graph context");
        }
        return { passwordSalt, passwordHash };
    }
    _writeAdminPassword(password) {
        const credentials = JSON.stringify({ username: ADMIN_USERNAME, password }, null, 2);
        (0, fs_1.writeFileSync)(this.credentialsPath, credentials, { encoding: "utf8", mode: 0o600 });
        (0, fs_1.chmodSync)(this.credentialsPath, 0o600);
    }
    _getGraphService() {
        const { GraphService } = require("./GraphService");
        const graphService = GraphService.getInstance();
        this.graphService = graphService;
        return graphService;
    }
}
exports.default = UserService;
//# sourceMappingURL=UserService.js.map
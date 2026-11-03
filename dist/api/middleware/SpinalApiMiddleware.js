"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalApiMiddleware = void 0;
const UserService_1 = __importDefault(require("../services/UserService"));
class SpinalApiMiddleware {
    static checkMonitoringToken(req, res, next) {
        const isSwaggerDocumentationRequest = (req.method === "GET" || req.method === "HEAD") &&
            (req.path === "/monitoring/swagger.json" || req.path === "/monitoring/api-docs" || req.path.startsWith("/monitoring/api-docs/"));
        if (isSwaggerDocumentationRequest ||
            (req.method === "GET" && req.path === "/monitoring/health") ||
            (req.method === "POST" && req.path === "/auth/login")) {
            next();
            return;
        }
        const bearerToken = req.header("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
        if (!bearerToken || !UserService_1.default.getInstance().isTokenValid(bearerToken)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        next();
    }
}
exports.SpinalApiMiddleware = SpinalApiMiddleware;
exports.default = SpinalApiMiddleware;
//# sourceMappingURL=SpinalApiMiddleware.js.map
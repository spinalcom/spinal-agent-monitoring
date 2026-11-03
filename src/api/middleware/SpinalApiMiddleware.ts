import { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService";

export class SpinalApiMiddleware {
	public static checkMonitoringToken(req: Request, res: Response, next: NextFunction): void {
		const isSwaggerDocumentationRequest =
			(req.method === "GET" || req.method === "HEAD") &&
			(req.path === "/monitoring/swagger.json" || req.path === "/monitoring/api-docs" || req.path.startsWith("/monitoring/api-docs/"));
		if (
			isSwaggerDocumentationRequest ||
			(req.method === "GET" && req.path === "/monitoring/health") ||
			(req.method === "POST" && req.path === "/auth/login")
		) {
			next();
			return;
		}

		const bearerToken = req.header("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
		if (!bearerToken || !UserService.getInstance().isTokenValid(bearerToken)) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		next();
	}
}

export default SpinalApiMiddleware;

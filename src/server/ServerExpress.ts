import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "./routes";
import { HTTP_RESPONSES } from "../utils/HTTP_RESPONSE";
import { InitSwagger } from "./swagger";
import morgan from "morgan";

export function runExpressServer(port?: number | string): { app: express.Application; server: any } {
	const app = express();

	app.use(express.json());
	app.use(morgan("dev")); // Add morgan middleware for logging

	InitSwagger(app);

	RegisterRoutes(app);

	app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
		if (err instanceof ValidateError) {
			res.status(HTTP_RESPONSES.BAD_REQUEST.code).json({
				message: "Validation Failed",
				details: err?.fields,
			});
			return;
		}

		if (err instanceof Error) {
			res.status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code).json({ message: "Internal Server Error", details: err.message });
			return;
		}

		next();
	});

	app.use((_req: Request, res: Response) => {
		res.status(HTTP_RESPONSES.NOT_FOUND.code).json({ error: "Route not found." });
	});

	const PORT = port || 3000;

	const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

	return { app, server };
}

export default runExpressServer;

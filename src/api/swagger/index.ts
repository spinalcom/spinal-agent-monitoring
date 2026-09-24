import * as swaggerUi from "swagger-ui-express";
import express, { NextFunction, Request, Response } from "express";
import path from "path";

const swaggerOption = {
	swaggerOptions: {
		swaggerDefinition: {
			info: {
				"x-logo": {
					url: "/admin/logo",
				},
				"x-favicon": {
					url: "/admin/favicon",
				},
			},
		},
	},
	customCss: ".topbar-wrapper img {content: url(/admin/logo);} .swagger-ui .topbar {background: #dbdbdb;}",
};

export function InitSwagger(app: express.Application) {
	app.get("/monitoring/swagger.json", (_req: Request, res: Response) => {
		res.sendFile(path.resolve(__dirname, "./swagger.json"));
	});

	app.use("/monitoring/api-docs", swaggerUi.serve, async (_req: Request, res: Response, next: NextFunction) => {
		return swaggerUi.setup(await import("./swagger.json"), swaggerOption)(_req, res, next);
	});
}

export default InitSwagger;

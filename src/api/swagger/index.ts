import * as swaggerUi from "swagger-ui-express";
import express, { NextFunction, Request, Response } from "express";
import swaggerDocument from "./swagger.json";

type SecurityRequirement = Record<string, string[]>;
type OpenApiDocument = {
	components: { securitySchemes: Record<string, unknown> };
	paths: Record<string, Record<string, unknown>>;
	security?: SecurityRequirement[];
};
type OpenApiOperation = {
	responses: Record<string, unknown>;
	security?: SecurityRequirement[];
};

function getOpenApiDocument(): OpenApiDocument {
	const document = JSON.parse(JSON.stringify(swaggerDocument)) as OpenApiDocument;
	const bearerSecurity: SecurityRequirement[] = [{ jwt: [] }];
	document.security = bearerSecurity;

	for (const [routePath, pathItem] of Object.entries(document.paths)) {
		for (const [method, rawOperation] of Object.entries(pathItem)) {
			if (typeof rawOperation !== "object" || rawOperation === null || Array.isArray(rawOperation) || !("responses" in rawOperation)) {
				continue;
			}

			const operation = rawOperation as OpenApiOperation;
			const isPublicRoute = (method === "get" && routePath === "/monitoring/health") || (method === "post" && routePath === "/auth/login");
			operation.security = isPublicRoute ? [] : bearerSecurity;
		}
	}

	return document;
}

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
		res.json(getOpenApiDocument());
	});

	app.use("/monitoring/api-docs", swaggerUi.serve, async (_req: Request, res: Response, next: NextFunction) => {
		return swaggerUi.setup(getOpenApiDocument(), swaggerOption)(_req, res, next);
	});
}

export default InitSwagger;

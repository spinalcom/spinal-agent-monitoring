import express from "express";
import { RegisterRoutes } from "../api/routes";
import { InitSwagger } from "../api/swagger";
import { Server } from "socket.io";
import { WebsocketMiddleware } from "../api/middleware/webSocketMiddleware";
import DefaultSpinalApiMiddleware from "../api/middleware/SpinalApiMiddleware";
import type { ISpinalApiMiddleware } from "../interfaces";
import UserService from "../api/services/UserService";
import SpinalhubService from "../api/services/SpinalhubService";

export async function registerMonitoringAgent(app: express.Application, io: Server, spinalApiMiddleware: ISpinalApiMiddleware, configFilePath?: string): Promise<void> {
	SpinalhubService.getInstance().setConnection(spinalApiMiddleware.conn);

	await SpinalhubService.getInstance().initializeConfigFile(configFilePath);
	// await UserService.getInstance().initialize();

	if (!spinalApiMiddleware.checkMonitoringToken) {
		throw new Error(`"checkMonitoringToken" method is not defined in SpinalApiMiddleware`);
	}

	app.use(spinalApiMiddleware.checkMonitoringToken);

	InitSwagger(app);
	RegisterRoutes(app);
	WebsocketMiddleware.getInstance().init(io);
}

export * from "../utils";
export * from "../system";
export * from "../api/models";

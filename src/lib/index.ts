import express from "express";
import { RegisterRoutes } from "../api/routes";
import { InitSwagger } from "../api/swagger";
import { Server } from "socket.io";
import { WebsocketMiddleware } from "../api/middleware/webSocketMiddleware";
import SpinalhubService from "../api/services/SpinalhubService";

export async function registerMonitoringAgent(app: express.Application, io: Server, conn: spinal.FileSystem, configFilePath?: string): Promise<void> {
	SpinalhubService.getInstance().setConnection(conn);
	await SpinalhubService.getInstance().initializeConfigFile(configFilePath);

	InitSwagger(app);
	RegisterRoutes(app);
	WebsocketMiddleware.getInstance().init(io);
}

export * from "../utils";
export * from "../system";
export * from "../api/models";

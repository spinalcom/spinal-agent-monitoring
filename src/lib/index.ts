import express from "express";
import { RegisterRoutes } from "../server/routes";
import { InitSwagger } from "../server/swagger";
import { Server } from "socket.io";
import { WebsocketMiddleware } from "../server/middleware/webSocketMiddleware";

export function registerMonitoringAgent(app: express.Application, io: Server): void {
	InitSwagger(app);
	RegisterRoutes(app);
	WebsocketMiddleware.getInstance().init(io);
}

export * from "../utils";
export * from "../services";
export * from "../models";

import express from "express";
import { Server } from "socket.io";
import type { ISpinalApiMiddleware } from "../interfaces";
export declare function registerMonitoringAgent(app: express.Application, io: Server, conn: spinal.FileSystem, configFilePath?: string, spinalApiMiddleware?: ISpinalApiMiddleware): Promise<void>;
export * from "../utils";
export * from "../system";
export * from "../api/models";

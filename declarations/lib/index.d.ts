import express from "express";
import { Server } from "socket.io";
export declare function registerMonitoringAgent(app: express.Application, io: Server, conn: spinal.FileSystem, configFilePath?: string): Promise<void>;
export * from "../utils";
export * from "../system";
export * from "../api/models";

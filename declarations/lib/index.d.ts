import express from "express";
import { Server } from "socket.io";
export declare function registerMonitoringAgent(app: express.Application, io: Server): void;
export default registerMonitoringAgent;

import { RequestHandler } from "express";

export interface ISpinalApiMiddleware {
	conn: spinal.FileSystem;
	checkMonitoringToken: RequestHandler;
	[key: string]: any;
}

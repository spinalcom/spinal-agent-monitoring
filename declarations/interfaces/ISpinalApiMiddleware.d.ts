import { RequestHandler } from "express";
export interface ISpinalApiMiddleware {
    checkMonitoringToken: RequestHandler;
    [key: string]: any;
}

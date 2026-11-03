import { NextFunction, Request, Response } from "express";
export declare class SpinalApiMiddleware {
    static checkMonitoringToken(req: Request, res: Response, next: NextFunction): void;
}
export default SpinalApiMiddleware;

import "reflect-metadata";
import express from "express";
export declare function runExpressServer(port?: number | string): Promise<{
    app: express.Application;
    server: any;
}>;
export default runExpressServer;

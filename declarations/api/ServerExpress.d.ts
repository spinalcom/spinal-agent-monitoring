import "reflect-metadata";
import express from "express";
export declare function runExpressServer(port?: number | string): {
    app: express.Application;
    server: any;
};
export default runExpressServer;

import { RequestHandler } from "express";
import UserService from "../services/UserService";
export declare function createAuthenticationMiddleware(userService?: UserService): RequestHandler;
export declare const authenticationMiddleware: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;

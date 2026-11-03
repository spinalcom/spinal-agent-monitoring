import { Request, Response } from "express";
export declare function expressAuthentication(request: Request, securityName: string, _scopes?: string[], response?: Response): Promise<{
    username: string;
}>;

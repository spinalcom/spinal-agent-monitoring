import { Controller } from "tsoa";
import { ErrorResponse } from "../../interfaces/IResponses";
interface AdminLoginRequest {
    username: string;
    password: string;
}
interface AdminLoginResponse {
    token: string;
    tokenType: "Bearer";
    expiresIn: number;
    access_token: string;
    token_type: "bearer";
    expires_in: number;
}
export declare class AuthController extends Controller {
    private readonly userService;
    login(credentials: AdminLoginRequest): Promise<AdminLoginResponse | ErrorResponse>;
}
export {};

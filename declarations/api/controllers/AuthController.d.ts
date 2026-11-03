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
}
export declare class AuthController extends Controller {
    private readonly userService;
    login(credentials: AdminLoginRequest): Promise<AdminLoginResponse | ErrorResponse>;
}
export {};

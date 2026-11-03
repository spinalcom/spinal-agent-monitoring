import { Body, Controller, Post, Route, SuccessResponse, Tags } from "tsoa";
import { ErrorResponse } from "../../interfaces/IResponses";
import UserService from "../services/UserService";

interface AdminLoginRequest {
	username: string;
	password: string;
}

interface AdminLoginResponse {
	token: string;
	tokenType: "Bearer";
	expiresIn: number;
}

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
	private readonly userService = UserService.getInstance();

	@Post("login")
	@SuccessResponse("200", "OK")
	public async login(@Body() credentials: AdminLoginRequest): Promise<AdminLoginResponse | ErrorResponse> {
		const result = await this.userService.login(credentials.username, credentials.password);
		if (!result) {
			this.setStatus(401);
			return { error: "Invalid username or password" };
		}

		return {
			...result,
			tokenType: "Bearer",
		};
	}
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runExpressServer = runExpressServer;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const tsoa_1 = require("tsoa");
const routes_1 = require("./routes");
const HTTP_RESPONSE_1 = require("../utils/HTTP_RESPONSE");
const swagger_1 = require("./swagger");
const morgan_1 = __importDefault(require("morgan"));
function runExpressServer(port) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("dev")); // Add morgan middleware for logging
    (0, swagger_1.InitSwagger)(app);
    (0, routes_1.RegisterRoutes)(app);
    app.use((err, _req, res, next) => {
        if (err instanceof tsoa_1.ValidateError) {
            res.status(HTTP_RESPONSE_1.HTTP_RESPONSES.BAD_REQUEST.code).json({
                message: "Validation Failed",
                details: err?.fields,
            });
            return;
        }
        if (err instanceof Error) {
            res.status(HTTP_RESPONSE_1.HTTP_RESPONSES.INTERNAL_SERVER_ERROR.code).json({ message: "Internal Server Error", details: err.message });
            return;
        }
        next();
    });
    app.use((_req, res) => {
        res.status(HTTP_RESPONSE_1.HTTP_RESPONSES.NOT_FOUND.code).json({ error: "Route not found." });
    });
    const PORT = port || 3000;
    const server = app.listen(PORT, () => console.log(`Express server started on port ${PORT}`));
    return { app, server };
}
exports.default = runExpressServer;
//# sourceMappingURL=ServerExpress.js.map
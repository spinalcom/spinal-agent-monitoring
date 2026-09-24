"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMonitoringAgent = registerMonitoringAgent;
const routes_1 = require("../api/routes");
const swagger_1 = require("../api/swagger");
const webSocketMiddleware_1 = require("../api/middleware/webSocketMiddleware");
const SpinalhubService_1 = __importDefault(require("../api/services/SpinalhubService"));
async function registerMonitoringAgent(app, io, conn, configFilePath) {
    SpinalhubService_1.default.getInstance().setConnection(conn);
    await SpinalhubService_1.default.getInstance().initializeConfigFile(configFilePath);
    (0, swagger_1.InitSwagger)(app);
    (0, routes_1.RegisterRoutes)(app);
    webSocketMiddleware_1.WebsocketMiddleware.getInstance().init(io);
}
__exportStar(require("../utils"), exports);
__exportStar(require("../system"), exports);
__exportStar(require("../api/models"), exports);
//# sourceMappingURL=index.js.map
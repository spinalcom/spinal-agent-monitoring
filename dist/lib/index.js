"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMonitoringAgent = registerMonitoringAgent;
const routes_1 = require("../server/routes");
const swagger_1 = require("../server/swagger");
const webSocketMiddleware_1 = require("../server/middleware/webSocketMiddleware");
function registerMonitoringAgent(app, io) {
    (0, swagger_1.InitSwagger)(app);
    (0, routes_1.RegisterRoutes)(app);
    webSocketMiddleware_1.WebsocketMiddleware.getInstance().init(io);
}
exports.default = registerMonitoringAgent;
//# sourceMappingURL=index.js.map
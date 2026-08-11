"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigFileService_1 = __importDefault(require("./services/ConfigFileService"));
const Pm2Service_1 = require("./services/Pm2Service");
const SpinalhubService_1 = __importDefault(require("./services/SpinalhubService"));
const SystemOverviewService_1 = __importDefault(require("./services/SystemOverviewService"));
const server_1 = require("./server");
const config_1 = __importDefault(require("./utils/config"));
const systemOverview = SystemOverviewService_1.default.getInstance();
const configFileService = ConfigFileService_1.default.getInstance();
const spinalHubService = SpinalhubService_1.default.getInstance();
const pm2Service = Pm2Service_1.Pm2Service.getInstance();
// const zabbixSenderService = ZabbixSenderService.getInstance();
// const websocketMiddleware = WebsocketMiddleware.getInstance();
(async () => {
    try {
        const connect = spinalHubService.connect();
        if (!connect)
            throw new Error("Unable to connect to Spinalhub. Please check your configuration.");
        console.log("Connected to Spinalhub successfully.");
        const systemInfo = systemOverview.getSystemMetricsFormatted();
        console.log("initializing config file...");
        await configFileService.initializeConfigFile(connect, systemInfo, config_1.default.monitoringApiConfig.organName);
        console.log("Config file initialized successfully.");
        console.log("Starting Express server...");
        const { app, server } = (0, server_1.runExpressServer)(config_1.default.monitoringApiConfig.serverPort);
        (0, server_1.runWebSocketServer)(server);
        // initialize pm2 service and refresh pm2 processes on change
        await pm2Service.initializePm2Service((data) => {
            console.log("PM2 processes updated");
            configFileService.updatePm2List();
        });
        // start periodic system metrics push
        systemOverview.startPeriodicSystemMetricsPush();
        // zabbixSenderService.startPeriodicPush((update) => {
        // 	websocketMiddleware.sendZabbixPushEvent(update);
        // });
    }
    catch (error) {
        console.error(error);
    }
})();
// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());
//# sourceMappingURL=index.js.map
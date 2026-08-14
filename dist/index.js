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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const lodash = __importStar(require("lodash"));
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
        console.log("initializing config file...");
        const graph = await configFileService.initializeConfigFile(connect, config_1.default.monitoringApiConfig.organName);
        console.log("Config file initialized successfully.");
        console.log("Initializing system overview and PM2 service...");
        const initPromise = [systemOverview.initialize(graph), pm2Service.initialize(graph)];
        await Promise.all(initPromise);
        console.log("System overview and PM2 service initialized successfully.");
        //////////////////////////////////////////////////////////////////////
        // Uncomment the following code to enable WebSocket connection to the server
        //////////////////////////////////////////////////////////////////////
        // const socket = io(`http://localhost:5051`, { transports: ["websocket"] });
        // socket.on("connect", () => {
        // 	console.log("Connected to WebSocket server");
        // 	const macAddress = SystemOverviewService.getInstance().getMacAddress();
        // 	if (!macAddress) {
        // 		console.error("❌ Impossible de récupérer l'adresse MAC. Abandon.");
        // 		return;
        // 	}
        // 	socket.emit("register-agent", { serverId: macAddress });
        // 	console.log("📡 Agent enregistré avec serverID =", macAddress);
        // });
        //////////////////////////////////////////////////////////////////////
        console.log("Starting Express server...");
        const { app, server } = (0, server_1.runExpressServer)(config_1.default.monitoringApiConfig.serverPort);
        (0, server_1.runWebSocketServer)(server);
        console.log(`Socket server is running`);
        const intervalTime = config_1.default.monitoringApiConfig.systemInfoIntervalMs;
        // start periodic system metrics push
        systemOverview.startPeriodicSystemMetricsPush(intervalTime);
        // start periodic pm2 metrics push
        pm2Service.startPeriodicPm2MetricsPush(intervalTime);
        const updatePm2ListDebounce = lodash.debounce(pm2Service.updatePm2Processes.bind(pm2Service), 1000);
        // initialize pm2 service and refresh pm2 processes on change
        await pm2Service.listentPm2Actions((data) => updatePm2ListDebounce());
        // zabbixSenderService.startPeriodicPush((update) => websocketMiddleware.sendZabbixPushEvent(update));
    }
    catch (error) {
        console.error(error);
    }
})();
// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());
//# sourceMappingURL=index.js.map
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
const path = __importStar(require("path"));
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const ConfigFileService_1 = __importDefault(require("./services/ConfigFileService"));
const Pm2Service_1 = require("./services/Pm2Service");
const SpinalhubService_1 = __importDefault(require("./services/SpinalhubService"));
const SystemOverviewService_1 = __importDefault(require("./services/SystemOverviewService"));
const server_1 = require("./server");
const SpinalGraphService_1 = require("./services/SpinalGraphService");
const lodash = __importStar(require("lodash"));
const services_1 = require("./services");
const systemOverview = SystemOverviewService_1.default.getInstance();
const configFileService = ConfigFileService_1.default.getInstance();
const spinalHubService = SpinalhubService_1.default.getInstance();
const pm2Service = Pm2Service_1.Pm2Service.getInstance();
const spinalGraphService = SpinalGraphService_1.SpinalGraphService.getInstance();
const zabbixSenderService = services_1.ZabbixSenderService.getInstance();
// const websocketMiddleware = WebsocketMiddleware.getInstance();
(async () => {
    try {
        // Connect to Spinalhub
        const connect = spinalHubService.connect();
        if (!connect)
            throw new Error("Unable to connect to Spinalhub. Please check your configuration.");
        console.log("Connected to Spinalhub successfully.");
        // create or load the config file and initialize the graph
        console.log("initializing config file...");
        const graph = await configFileService.initializeConfigFile(connect);
        console.log("Config file initialized successfully.");
        // Set the graph in SpinalGraphService
        spinalGraphService.setGraph(graph);
        console.log("Initializing system overview and PM2 service...");
        const systemMetrics = systemOverview.getSystemMetricsFormatted();
        const pm2Instances = await pm2Service.getAllPm2Processes();
        const agentName = process.env.AGENT_NAME || "";
        await spinalGraphService.setupSystemMetricsAndPm2(agentName, systemMetrics, pm2Instances);
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
        const { app, server } = (0, server_1.runExpressServer)(process.env.SERVER_PORT || 3000);
        (0, server_1.runWebSocketServer)(server);
        console.log(`Socket server is running`);
        const intervalTime = parseInt(process.env.SYSTEM_INFO_SEND_INTERVAL_MS || "30000");
        setInterval(async () => {
            console.log("Updating system metrics and PM2 processes...");
            const systemMetrics = systemOverview.getSystemMetricsFormatted();
            const pm2Processes = await pm2Service.getAllPm2Processes();
            await spinalGraphService.updateSystemMetrics(systemMetrics);
            console.log("System metrics updated successfully.");
            await spinalGraphService.updatePm2ProcessesMetrics(pm2Processes);
            console.log("PM2 processes metrics updated successfully.");
            // const promises = [];
            // await Promise.all(promises);
            console.log("System metrics and PM2 processes updated successfully.");
        }, intervalTime);
        // start periodic system metrics push
        // systemOverview.startPeriodicSystemMetricsPush(intervalTime);
        // pm2Service.startPeriodicPm2MetricsPush(intervalTime);
        const treatPm2EventDebounced = lodash.debounce(spinalGraphService.treatPm2Event.bind(spinalGraphService), 1000);
        // initialize pm2 service and refresh pm2 processes on change
        await pm2Service.listentPm2Actions(async (data) => {
            treatPm2EventDebounced(data);
        });
        if (zabbixSenderService.isCorrectlyConfigured()) {
            const interval = process.env.ZABBIX_PUSH_INTERVAL_MS || 15000;
            zabbixSenderService.startPeriodicPush(Number(interval));
        }
    }
    catch (error) {
        console.error(error);
    }
})();
//TODO: max day 60 dans .env
// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());
//# sourceMappingURL=index.js.map
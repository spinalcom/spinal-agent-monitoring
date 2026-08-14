import ConfigFileService from "./services/ConfigFileService";
import { Pm2Service } from "./services/Pm2Service";
import SpinalhubService from "./services/SpinalhubService";
import SystemOverviewService from "./services/SystemOverviewService";
import { runExpressServer, runWebSocketServer } from "./server";
import config from "./utils/config";
import * as lodash from "lodash";

const systemOverview = SystemOverviewService.getInstance();
const configFileService = ConfigFileService.getInstance();
const spinalHubService = SpinalhubService.getInstance();
const pm2Service = Pm2Service.getInstance();
import { io } from "socket.io-client";

// const zabbixSenderService = ZabbixSenderService.getInstance();
// const websocketMiddleware = WebsocketMiddleware.getInstance();

(async () => {
	try {
		const connect = spinalHubService.connect();
		if (!connect) throw new Error("Unable to connect to Spinalhub. Please check your configuration.");

		console.log("Connected to Spinalhub successfully.");

		console.log("initializing config file...");
		const graph = await configFileService.initializeConfigFile(connect, config.monitoringApiConfig.organName);
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
		const { app, server } = runExpressServer(config.monitoringApiConfig.serverPort);
		runWebSocketServer(server);
		console.log(`Socket server is running`);

		const intervalTime = config.monitoringApiConfig.systemInfoIntervalMs;

		// start periodic system metrics push
		systemOverview.startPeriodicSystemMetricsPush(intervalTime);
		// start periodic pm2 metrics push
		pm2Service.startPeriodicPm2MetricsPush(intervalTime);

		const updatePm2ListDebounce = lodash.debounce(pm2Service.updatePm2Processes.bind(pm2Service), 1000);
		// initialize pm2 service and refresh pm2 processes on change
		await pm2Service.listentPm2Actions((data) => updatePm2ListDebounce());

		// zabbixSenderService.startPeriodicPush((update) => websocketMiddleware.sendZabbixPushEvent(update));
	} catch (error) {
		console.error(error);
	}
})();

// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());

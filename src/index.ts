import * as path from "path";

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
import ConfigFileService from "./services/ConfigFileService";
import { Pm2Service } from "./services/Pm2Service";
import SpinalhubService from "./services/SpinalhubService";
import SystemOverviewService from "./services/SystemOverviewService";
import { runExpressServer, runWebSocketServer } from "./server";
import { SpinalGraphService } from "./services/SpinalGraphService";
import { io } from "socket.io-client";
import * as lodash from "lodash";
import { IPm2EventData } from "./interfaces";
import { ZabbixSenderService } from "./services";

const systemOverview = SystemOverviewService.getInstance();
const configFileService = ConfigFileService.getInstance();
const spinalHubService = SpinalhubService.getInstance();
const pm2Service = Pm2Service.getInstance();
const spinalGraphService = SpinalGraphService.getInstance();

const zabbixSenderService = ZabbixSenderService.getInstance();
// const websocketMiddleware = WebsocketMiddleware.getInstance();

(async () => {
	try {
		// Connect to Spinalhub
		const connect = spinalHubService.connect();
		if (!connect) throw new Error("Unable to connect to Spinalhub. Please check your configuration.");
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
		const { app, server } = runExpressServer(process.env.SERVER_PORT || 3000);
		runWebSocketServer(server);
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
		await pm2Service.listentPm2Actions(async (data: IPm2EventData) => {
			treatPm2EventDebounced(data);
		});

		if (zabbixSenderService.isCorrectlyConfigured()) {
			const interval = process.env.ZABBIX_PUSH_INTERVAL_MS || 15000;
			zabbixSenderService.startPeriodicPush(Number(interval));
		}
	} catch (error) {
		console.error(error);
	}
})();

//TODO: max day 60 dans .env

// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());

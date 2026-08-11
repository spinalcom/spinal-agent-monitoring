import ConfigFileService from "./services/ConfigFileService";
import { Pm2Service } from "./services/Pm2Service";
import SpinalhubService from "./services/SpinalhubService";
import SystemOverviewService from "./services/SystemOverviewService";
import { runExpressServer, runWebSocketServer } from "./server";
import { config } from "./utils/config";

const systemOverview = SystemOverviewService.getInstance();
const configFileService = ConfigFileService.getInstance();
const spinalHubService = SpinalhubService.getInstance();
const pm2Service = Pm2Service.getInstance();
// const zabbixSenderService = ZabbixSenderService.getInstance();
// const websocketMiddleware = WebsocketMiddleware.getInstance();

(async () => {
	try {
		const connect = spinalHubService.connect();
		if (!connect) throw new Error("Unable to connect to Spinalhub. Please check your configuration.");

		console.log("Connected to Spinalhub successfully.");
		const systemInfo = systemOverview.getSystemMetricsFormatted();

		console.log("initializing config file...");
		await configFileService.initializeConfigFile(connect, systemInfo);
		console.log("Config file initialized successfully.");

		console.log("Starting Express server...");
		const { app, server } = runExpressServer(config.monitoringApiConfig.serverPort);
		runWebSocketServer(server);

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
	} catch (error) {
		console.error(error);
	}
})();

// console.log("system overview:", systemOverview.getMacAddress());
// console.log("system overview:", systemOverview.getCpuInfo());
// console.log("system overview:", systemOverview.getSystemMetrics());

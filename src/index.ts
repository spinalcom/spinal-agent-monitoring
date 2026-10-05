import { runExpressServer } from "./api";
import { ConfigFileService, GraphService } from "./api/services";
import { SpinalhubService } from "./api/services/SpinalhubService";
import type { SpinalContext } from "spinal-model-graph";
import { Pm2LogPayload, Pm2Service, SystemOverviewService, ZabbixSenderService } from "./system";
import os from "os";
import lodash from "lodash";
import { IPm2EventData } from "./interfaces";
import { Lst, spinalCore } from "spinal-core-connectorjs";
import { SpinalCommand } from "./lib";

import { configDotenv } from "dotenv";
import path from "path";
configDotenv({ path: path.resolve(__dirname, "../.env") });

type RuntimeServices = {
	spinalhubService: SpinalhubService;
	configFileService: ConfigFileService;
	graphService: GraphService;
	systemOverviewService: SystemOverviewService;
	pm2Service: Pm2Service;
	zabbixSenderService: ZabbixSenderService;
};

function connectToSpinalhub(): spinal.FileSystem {
	const protocol = process.env.SPINALHUB_PROTOCOL; // user id
	const user = process.env.SPINAL_USER_ID; // user id
	const password = process.env.SPINAL_PASSWORD; // user password
	const host = process.env.SPINALHUB_IP; // can be an ip address
	const port = process.env.SPINALHUB_PORT;

	if (!protocol || !user || !password || !host) {
		throw new Error("Missing configuration for Spinalhub connection. Please check your environment variables.");
	}

	let connect_opt = `${protocol}://${user}:${password}@${host}`;
	if (port) connect_opt += `:${port}`;

	return spinalCore.connect(connect_opt);
}

const commandExecuted: { [key: string]: boolean } = {};

function getServices(): RuntimeServices {
	return {
		spinalhubService: SpinalhubService.getInstance(),
		configFileService: ConfigFileService.getInstance(),
		graphService: GraphService.getInstance(),
		systemOverviewService: SystemOverviewService.getInstance(),
		pm2Service: Pm2Service.getInstance(),
		zabbixSenderService: ZabbixSenderService.getInstance(),
	};
}

async function bindCommandList(vmNode: SpinalContext, services: RuntimeServices) {
	const commandList: Lst<SpinalCommand> = await vmNode.info.pm2_commands?.load();

	vmNode.info.lastCommand.bind(async () => {
		if (!commandList) {
			console.warn("No command list found for VM context:", vmNode.getName().get());
			return;
		}

		const commands = Array.from(commandList);

		for (const commandModel of commands) {
			const commandIsExecuted = commandExecuted[commandModel.id.get()];
			const commandIsNotAvailable = !commandModel.isAvailable();

			if (commandIsExecuted || commandIsNotAvailable) {
				await commandModel.removeFromGraph();
				continue;
			}

			commandExecuted[commandModel.id.get()] = true;
			await commandModel.execute(services.pm2Service);
		}
	});
}

async function initializeGraphContext(services: RuntimeServices) {
	const connect = connectToSpinalhub();
	if (!connect) throw new Error("Unable to connect to Spinalhub. Please check your configuration.");

	SpinalhubService.getInstance().setConnection(connect);
	console.log("Connected to Spinalhub successfully.");

	const hostName = process.env.HOST_NAME || os.hostname();
	const configFilePath = process.env.CONFIG_FILE_PATH || `/etc/Organs/Monitoring/${os.hostname()}`;

	console.log("initializing config file...");
	const graph = await SpinalhubService.getInstance().initializeConfigFile(configFilePath);
	console.log("Config file initialized successfully.");

	console.log("Initializing system overview and PM2 service...");
	const systemMetrics = services.systemOverviewService.getSystemMetricsFormatted();
	const pm2Instances = await services.pm2Service.getAllPm2Processes();

	const vmContext = await services.graphService.registerVirtualMachine(hostName, { systemMetrics, pm2List: pm2Instances });
	console.log("System overview and PM2 service initialized successfully.");

	return vmContext;
}

function startPeriodicMetricsUpdate(services: RuntimeServices, vmContext: any): void {
	const updateSystemAndPm2Metrics = async () => {
		console.log("Updating system metrics and PM2 processes...");
		const currentSystemMetrics = services.systemOverviewService.getSystemMetricsFormatted();
		const pm2Processes = await services.pm2Service.getAllPm2Processes();

		await services.graphService.updateOrCreateSystemMetrics(vmContext, currentSystemMetrics);
		console.log("System metrics updated successfully.");

		await services.graphService.updatePm2ProcessesMetrics(vmContext, pm2Processes);
		console.log("PM2 processes metrics updated successfully.");
		console.log("System metrics and PM2 processes updated successfully.");
	};

	const intervalMs = Number.parseInt(process.env.SYSTEM_INFO_SEND_INTERVAL_MS || "30000", 10);

	setInterval(() => {
		void updateSystemAndPm2Metrics();
	}, intervalMs);
}

async function startPm2Listeners(services: RuntimeServices, vmContext: any): Promise<void> {
	const debouncedPm2Handlers = new Map<string | number, lodash.DebouncedFunc<(context: any, event: IPm2EventData) => void>>();

	// Listen to PM2 actions and handle them with debounced handlers to avoid excessive updates.
	// Debounced handlers help to reduce the frequency of updates for the same PM2 process

	await services.pm2Service.listenToPm2Actions(async (data: IPm2EventData) => {
		const processKey = data.process?.pm_id ?? data.process?.name;

		if (processKey === undefined || processKey === null) {
			await services.graphService.handlePm2Event(vmContext, data);
			return;
		}

		let debouncedHandler = debouncedPm2Handlers.get(processKey);
		if (!debouncedHandler) {
			debouncedHandler = lodash.debounce((context: any, event: IPm2EventData) => {
				void services.graphService.handlePm2Event(context, event);
			}, 1000);
			// Store the debounced handler for future use to prevent creating multiple handlers for the same process.
			debouncedPm2Handlers.set(processKey, debouncedHandler);
		}

		debouncedHandler(vmContext, data);
	});

	// Watch for PM2 log updates and update the corresponding log files in the graph.
	await services.pm2Service.watchPm2Logs(async (data: Pm2LogPayload) => {
		const pm_id = data.pm_id || data.name;
		const pm2Node = await services.graphService.getPm2ProcessNodeByKey(vmContext, pm_id);
		if (!pm2Node) return;

		const logType = data.type || "out";

		await services.graphService.updatePm2LogFileContent(pm2Node, logType as "out" | "err", data.content);
	});
}

function startZabbixPushIfConfigured(zabbixSenderService: ZabbixSenderService): void {
	if (!zabbixSenderService.isCorrectlyConfigured()) return;

	const interval = process.env.ZABBIX_PUSH_INTERVAL_MS || 15000;
	zabbixSenderService.startPeriodicPush(Number(interval));
}

(async () => {
	try {
		const services = getServices();
		const vmContext = await initializeGraphContext(services);

		bindCommandList(vmContext, services);

		startPeriodicMetricsUpdate(services, vmContext);
		await startPm2Listeners(services, vmContext);
		startZabbixPushIfConfigured(services.zabbixSenderService);

		const port = Number.parseInt(process.env.SERVER_PORT || "3000", 10);
		runExpressServer(port);
	} catch (error) {
		console.error(error);
	}
})();

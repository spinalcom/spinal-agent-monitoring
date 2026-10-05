"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const services_1 = require("./api/services");
const SpinalhubService_1 = require("./api/services/SpinalhubService");
const system_1 = require("./system");
const os_1 = __importDefault(require("os"));
const lodash_1 = __importDefault(require("lodash"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.configDotenv)({ path: path_1.default.resolve(__dirname, "../.env") });
function connectToSpinalhub() {
    const protocol = process.env.SPINALHUB_PROTOCOL; // user id
    const user = process.env.SPINAL_USER_ID; // user id
    const password = process.env.SPINAL_PASSWORD; // user password
    const host = process.env.SPINALHUB_IP; // can be an ip address
    const port = process.env.SPINALHUB_PORT;
    if (!protocol || !user || !password || !host) {
        throw new Error("Missing configuration for Spinalhub connection. Please check your environment variables.");
    }
    let connect_opt = `${protocol}://${user}:${password}@${host}`;
    if (port)
        connect_opt += `:${port}`;
    return spinal_core_connectorjs_1.spinalCore.connect(connect_opt);
}
const commandExecuted = {};
function getServices() {
    return {
        spinalhubService: SpinalhubService_1.SpinalhubService.getInstance(),
        configFileService: services_1.ConfigFileService.getInstance(),
        graphService: services_1.GraphService.getInstance(),
        systemOverviewService: system_1.SystemOverviewService.getInstance(),
        pm2Service: system_1.Pm2Service.getInstance(),
        zabbixSenderService: system_1.ZabbixSenderService.getInstance(),
    };
}
async function bindCommandList(vmNode, services) {
    const commandList = await vmNode.info.pm2_commands?.load();
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
async function initializeGraphContext(services) {
    const connect = connectToSpinalhub();
    if (!connect)
        throw new Error("Unable to connect to Spinalhub. Please check your configuration.");
    SpinalhubService_1.SpinalhubService.getInstance().setConnection(connect);
    console.log("Connected to Spinalhub successfully.");
    const hostName = process.env.HOST_NAME || os_1.default.hostname();
    const configFilePath = process.env.CONFIG_FILE_PATH || `/etc/Organs/Monitoring/${os_1.default.hostname()}`;
    console.log("initializing config file...");
    const graph = await SpinalhubService_1.SpinalhubService.getInstance().initializeConfigFile(configFilePath);
    console.log("Config file initialized successfully.");
    console.log("Initializing system overview and PM2 service...");
    const systemMetrics = services.systemOverviewService.getSystemMetricsFormatted();
    const pm2Instances = await services.pm2Service.getAllPm2Processes();
    const vmContext = await services.graphService.registerVirtualMachine(hostName, { systemMetrics, pm2List: pm2Instances });
    console.log("System overview and PM2 service initialized successfully.");
    return vmContext;
}
function startPeriodicMetricsUpdate(services, vmContext) {
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
async function startPm2Listeners(services, vmContext) {
    const debouncedPm2Handlers = new Map();
    // Listen to PM2 actions and handle them with debounced handlers to avoid excessive updates.
    // Debounced handlers help to reduce the frequency of updates for the same PM2 process
    await services.pm2Service.listenToPm2Actions(async (data) => {
        const processKey = data.process?.pm_id ?? data.process?.name;
        if (processKey === undefined || processKey === null) {
            await services.graphService.handlePm2Event(vmContext, data);
            return;
        }
        let debouncedHandler = debouncedPm2Handlers.get(processKey);
        if (!debouncedHandler) {
            debouncedHandler = lodash_1.default.debounce((context, event) => {
                void services.graphService.handlePm2Event(context, event);
            }, 1000);
            // Store the debounced handler for future use to prevent creating multiple handlers for the same process.
            debouncedPm2Handlers.set(processKey, debouncedHandler);
        }
        debouncedHandler(vmContext, data);
    });
    // Watch for PM2 log updates and update the corresponding log files in the graph.
    await services.pm2Service.watchPm2Logs(async (data) => {
        const pm_id = data.pm_id || data.name;
        const pm2Node = await services.graphService.getPm2ProcessNodeByKey(vmContext, pm_id);
        if (!pm2Node)
            return;
        const logType = data.type || "out";
        await services.graphService.updatePm2LogFileContent(pm2Node, logType, data.content);
    });
}
function startZabbixPushIfConfigured(zabbixSenderService) {
    if (!zabbixSenderService.isCorrectlyConfigured())
        return;
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
        (0, api_1.runExpressServer)(port);
    }
    catch (error) {
        console.error(error);
    }
})();
//# sourceMappingURL=index.js.map
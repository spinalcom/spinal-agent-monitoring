"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFileService = void 0;
const os_1 = __importDefault(require("os"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const path_1 = __importDefault(require("path"));
const ConfigFileModel_1 = __importDefault(require("../models/ConfigFileModel"));
const Pm2Service_1 = require("./Pm2Service");
class ConfigFileService {
    constructor() {
        this.configFileModel = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ConfigFileService();
        }
        return this._instance;
    }
    async initializeConfigFile(spinalConnection, systemInfo, organName) {
        organName = organName || os_1.default.hostname();
        // const configFileName = `VM_MONITORING_${organName}`;
        const configFileName = `${organName}`;
        const configFilePath = `/etc/Organs/Monitoring/${configFileName}`;
        const configFile = await this._loadOrMakeConfigFile(spinalConnection, configFilePath, organName, "Monitoring", systemInfo);
        await configFile.initialize(organName, "Monitoring", os_1.default.hostname(), systemInfo);
        this.configFileModel = configFile;
        // Refresh PM2 processes after initializing the config file
        await this.updatePm2List();
        // Bind the command list to listen for new commands
        configFile.bindCommandList();
        return this.configFileModel;
    }
    async updatePm2List() {
        const processes = await Pm2Service_1.Pm2Service.getInstance().getAllPm2Processes();
        this.pm2_processes = await this.configFileModel?.updatePm2Processes(processes);
        return this.pm2_processes;
    }
    refreshSystemMetrics(systemInfo) {
        if (this.configFileModel)
            this.configFileModel.updateMetrics(systemInfo);
    }
    async refreshPm2Metrics() {
        if (this.configFileModel)
            await this.configFileModel.updatePm2Metrics();
    }
    _loadOrMakeConfigFile(spinalConnection, filePath, organName, organType, systemInfo) {
        return new Promise((resolve, reject) => {
            spinal_core_connectorjs_1.spinalCore.load(spinalConnection, filePath, (model) => {
                model.updateMetrics(systemInfo);
                resolve(model);
            }, () => this._errorCallback(spinalConnection, filePath, organName, organType, systemInfo, resolve, reject));
        });
    }
    _errorCallback(connection, filePath, organName, organType, systemInfo, resolve, reject) {
        try {
            const directory = path_1.default.dirname(filePath);
            const fileName = path_1.default.basename(filePath);
            connection.load_or_make_dir(directory, (dir) => {
                const file = new ConfigFileModel_1.default(organName, organType, os_1.default.hostname(), systemInfo);
                dir.force_add_file(fileName, file, { model_type: "ConfigFile" });
                resolve(file);
            });
        }
        catch (error) {
            reject(error);
        }
    }
}
exports.default = ConfigFileService;
exports.ConfigFileService = ConfigFileService;
//# sourceMappingURL=ConfigFileService.js.map
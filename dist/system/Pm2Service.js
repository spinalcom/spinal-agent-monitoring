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
exports.Pm2Service = void 0;
const pm2_1 = __importDefault(require("pm2"));
const pm2Utils_1 = require("../utils/pm2Utils");
const fs = __importStar(require("fs"));
class Pm2Service {
    constructor() {
        this._isConnected = false;
        this.pm2Maps = new Map();
        this.logsWatcher = new Map();
        this._isPm2LogBusSubscribed = false;
    }
    static getInstance() {
        if (!this._instance)
            this._instance = new Pm2Service();
        return this._instance;
    }
    async listenToPm2Actions(callback) {
        this.subscribeToPm2EventStream(callback);
    }
    //////////////////////////////////////////////////////////////////////
    //  methods to interact with PM2
    //////////////////////////////////////////////////////////////////////
    async watchPm2Logs(callback) {
        this._pm2LogWatchCallback = callback;
        this._subscribeToPm2LogLifecycleEvents();
        await this._syncPm2LogWatchers(true);
    }
    stopWatchingPm2Logs() {
        this._pm2LogWatchCallback = undefined;
        if (this._pm2LogWatchSyncTimer) {
            clearTimeout(this._pm2LogWatchSyncTimer);
            this._pm2LogWatchSyncTimer = undefined;
        }
        for (const watcher of this.logsWatcher.values()) {
            watcher.close();
        }
        this.logsWatcher.clear();
    }
    _subscribeToPm2LogLifecycleEvents() {
        if (this._isPm2LogBusSubscribed)
            return;
        this._isPm2LogBusSubscribed = true;
        pm2_1.default.launchBus((err, bus) => {
            if (err) {
                this._isPm2LogBusSubscribed = false;
                return;
            }
            const scheduleSync = () => this._schedulePm2LogWatchersSync();
            bus.on("process:event", scheduleSync);
            bus.on("process:online", scheduleSync);
            bus.on("process:exit", scheduleSync);
            bus.on("process:delete", scheduleSync);
            bus.on("process:kill", scheduleSync);
            bus.on("process:exception", scheduleSync);
            bus.on("process:config_data_change", scheduleSync);
        });
    }
    _schedulePm2LogWatchersSync() {
        if (!this._pm2LogWatchCallback)
            return;
        if (this._pm2LogWatchSyncTimer)
            clearTimeout(this._pm2LogWatchSyncTimer);
        this._pm2LogWatchSyncTimer = setTimeout(() => {
            this._syncPm2LogWatchers(true).catch(() => { });
        }, 200);
    }
    async _syncPm2LogWatchers(emitInitialContent) {
        if (!this._pm2LogWatchCallback)
            return;
        const callback = this._pm2LogWatchCallback;
        const processes = await this.getAllPm2Processes();
        const desiredWatcherKeys = new Set();
        for (const process of processes) {
            for (const target of this._getProcessLogTargets(process)) {
                desiredWatcherKeys.add(target.watcherKey);
                if (this.logsWatcher.has(target.watcherKey))
                    continue;
                const watcher = await this._createLogWatcher(target, callback, emitInitialContent);
                if (!watcher)
                    continue;
                this.logsWatcher.set(target.watcherKey, watcher);
            }
        }
        for (const [watcherKey, watcher] of this.logsWatcher.entries()) {
            if (desiredWatcherKeys.has(String(watcherKey)))
                continue;
            watcher.close();
            this.logsWatcher.delete(watcherKey);
        }
    }
    _getProcessLogTargets(process) {
        const pm_id = process.pm_id;
        if (pm_id === undefined)
            return [];
        if (!this._shouldWatchProcessLogs(process))
            return [];
        const name = process.name ?? `pm2-${pm_id}`;
        const env = process.pm2_env;
        const candidates = [
            { type: "out", path: env?.pm_out_log_path },
            { type: "err", path: env?.pm_err_log_path },
        ];
        return candidates
            .filter((candidate) => !!candidate.path && fs.existsSync(candidate.path))
            .map((candidate) => {
            const logPath = candidate.path;
            return {
                pm_id,
                name,
                type: candidate.type,
                logPath,
                watcherKey: `${pm_id}-${candidate.type}`,
            };
        });
    }
    _shouldWatchProcessLogs(process) {
        const status = (process.pm2_env?.status || "").toLowerCase();
        return status === "online" || status === "launching";
    }
    async _createLogWatcher(target, callback, emitInitialContent) {
        let position = 0;
        try {
            position = fs.statSync(target.logPath).size;
        }
        catch (error) {
            return null;
        }
        if (emitInitialContent) {
            await this._emitInitialLogContent(target, callback);
        }
        const watcher = fs.watch(target.logPath, (eventType) => {
            if (eventType !== "change")
                return;
            this._emitAppendedLogContent(target, callback, position)
                .then((nextPosition) => {
                position = nextPosition;
            })
                .catch(() => { });
        });
        return watcher;
    }
    async _emitInitialLogContent(target, callback) {
        try {
            const content = await fs.promises.readFile(target.logPath, "utf8");
            if (!content)
                return;
            callback({
                pm_id: target.pm_id,
                name: target.name,
                type: target.type,
                file: target.logPath,
                content,
            });
        }
        catch (error) {
            return;
        }
    }
    async _emitAppendedLogContent(target, callback, currentPosition) {
        let size;
        try {
            size = fs.statSync(target.logPath).size;
        }
        catch (error) {
            return currentPosition;
        }
        const content = await fs.promises.readFile(target.logPath, "utf8");
        callback({
            pm_id: target.pm_id,
            name: target.name,
            type: target.type,
            file: target.logPath,
            content,
        });
        return size;
    }
    _readLogSlice(logPath, start, end) {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(logPath, {
                start,
                end,
                encoding: "utf8",
            });
            let content = "";
            stream.on("data", (chunk) => {
                content += chunk;
            });
            stream.on("end", () => resolve(content));
            stream.on("error", () => resolve(""));
        });
    }
    async getAllPm2Processes() {
        try {
            await this._connectToPm2();
            const processes = await this._listPm2Processes();
            return processes;
        }
        catch (error) {
            return [];
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async getPm2ProcessByKey(key) {
        try {
            await this._connectToPm2();
            const processes = await this._listPm2Processes();
            const process = processes.find((p) => p.name == key || p.pm_id?.toString() == key);
            return process || null;
        }
        catch (error) {
            return null;
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async startPm2Process(processKeys) {
        return this._executePm2BulkAction("start", processKeys);
    }
    async stopPm2Process(processKeys) {
        return this._executePm2BulkAction("stop", processKeys);
    }
    async restartPm2Process(processKeys) {
        return this._executePm2BulkAction("restart", processKeys);
    }
    async reloadPm2Process(processKeys) {
        return this._executePm2BulkAction("reload", processKeys);
    }
    async deletePm2Process(processKeys) {
        return this._executePm2BulkAction("delete", processKeys);
    }
    async runPm2Action(action, processKeys) {
        return this._executePm2BulkAction(action, processKeys);
    }
    async getPm2StatusSummary() {
        const processes = await this.getAllPm2Processes();
        const summary = {
            total: processes.length,
            online: 0,
            stopped: 0,
            errored: 0,
            other: 0,
        };
        for (const process of processes) {
            const status = (process.pm2_env?.status || "").toLowerCase();
            if (status === "online") {
                summary.online += 1;
            }
            else if (status === "stopped" || status === "stopping") {
                summary.stopped += 1;
            }
            else if (status === "errored") {
                summary.errored += 1;
            }
            else {
                summary.other += 1;
            }
        }
        return summary;
    }
    async getPm2ProcessMetricsByKey(key) {
        const process = await this.getPm2ProcessByKey(key);
        if (!process)
            return null;
        const formatted = (0, pm2Utils_1.formatProcess)(process);
        return {
            name: formatted.name,
            pm_id: formatted.pm_id,
            status: formatted.status,
            cpu: formatted.cpu,
            memory: formatted.memory,
            uptime: formatted.uptime,
            restarts: formatted.restarts,
        };
    }
    async getPm2ProcessLogsByKey(key, tail = 100, logType = "all") {
        const process = await this.getPm2ProcessByKey(key);
        if (!process)
            return null;
        const formatted = (0, pm2Utils_1.formatProcess)(process);
        const safeTail = Number.isFinite(tail) ? Math.max(1, Math.min(1000, Math.floor(tail))) : 100;
        const stdout = logType === "all" || logType === "out" ? await this._readLogTail(formatted.outLogPath, safeTail) : [];
        const stderr = logType === "all" || logType === "err" ? await this._readLogTail(formatted.errLogPath, safeTail) : [];
        return {
            name: formatted.name,
            pm_id: formatted.pm_id,
            tail: safeTail,
            stdout,
            stderr,
        };
    }
    async _executePm2BulkAction(action, processKeys) {
        const keys = Array.isArray(processKeys) ? processKeys : [processKeys];
        const messages = {
            start: { success: "Process started successfully", failure: "Failed to start process" },
            stop: { success: "Process stopped successfully", failure: "Failed to stop process" },
            restart: { success: "Process restarted successfully", failure: "Failed to restart process" },
            reload: { success: "Process reloaded successfully", failure: "Failed to reload process" },
            delete: { success: "Process deleted successfully", failure: "Failed to delete process" },
        };
        try {
            await this._connectToPm2();
            const promises = keys.map((key) => (0, pm2Utils_1.executeCommand)(action, key));
            const result = await Promise.all(promises);
            return result.map((res, index) => ({
                key: keys[index],
                success: res,
                message: res ? messages[action].success : messages[action].failure,
            }));
        }
        catch (error) {
            return keys.map((key) => ({
                key,
                success: false,
                message: messages[action].failure,
            }));
        }
        finally {
            // this._disconnectFromPm2();
        }
    }
    async _readLogTail(logPath, tail) {
        if (!logPath)
            return [];
        try {
            const content = await fs.promises.readFile(logPath, "utf8");
            const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
            return lines.slice(-tail);
        }
        catch (error) {
            return [];
        }
    }
    async subscribeToPm2EventStream(callback) {
        await this._connectToPm2();
        // const callBackWithDebounce = lodash.debounce(callback, 1000);
        pm2_1.default.launchBus((err, bus) => {
            if (err)
                throw err;
            bus.on("process:config_data_change", async (data) => {
                data.type = "process:config_data_change";
                if (typeof callback === "function")
                    await callback(data);
            });
            // Listen to general PM2 events (start, stop, restart, etc.)
            bus.on("process:event", async (data) => {
                data.type = "process:event";
                if (typeof callback === "function")
                    await callback(data);
                this._savePm2Event(data);
            });
        });
    }
    async getPm2MetricsFormatted() {
        const processes = await this.getAllPm2Processes();
        const formattedProcesses = processes.map((process) => {
            const formatted = (0, pm2Utils_1.formatProcess)(process);
            return {
                name: formatted.name,
                pm_id: formatted.pm_id,
                status: formatted.status,
                cpu: formatted.cpu,
                memory: formatted.memory,
                uptime: formatted.uptime,
            };
        });
        return formattedProcesses;
    }
    _connectToPm2() {
        return new Promise((resolve, reject) => {
            if (this._isConnected)
                return resolve();
            pm2_1.default.connect((err) => {
                if (err) {
                    this._isConnected = false;
                    reject(err);
                }
                else {
                    this._isConnected = true;
                    resolve();
                }
            });
        });
    }
    _listPm2Processes() {
        return new Promise((resolve, reject) => {
            pm2_1.default.list((err, processDescriptionList) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(processDescriptionList);
                }
            });
        });
    }
    _disconnectFromPm2() {
        pm2_1.default.disconnect();
    }
    _savePm2Event(eventData) {
        const key = eventData.process?.pm_id ?? eventData.process?.name;
        if (!key)
            return;
        const processNode = this.pm2Maps.get(key);
        if (!processNode)
            return;
    }
}
exports.Pm2Service = Pm2Service;
exports.default = Pm2Service;
//# sourceMappingURL=Pm2Service.js.map
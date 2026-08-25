"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeapInfo = getHeapInfo;
exports.waitUntil = waitUntil;
exports.formatProcess = formatProcess;
exports.executeCommand = executeCommand;
exports.getProcessId = getProcessId;
exports.getProcessStatusCode = getProcessStatusCode;
exports.getProcessLogPath = getProcessLogPath;
exports.uploadFileNewData = uploadFileNewData;
exports.convertProcessToObject = convertProcessToObject;
exports.executeIntervalProcessAction = executeIntervalProcessAction;
exports._initLogPathInHub = _initLogPathInHub;
exports.splitActionResults = splitActionResults;
exports.partitionResults = partitionResults;
const pm2_1 = __importDefault(require("pm2"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
function getHeapInfo(process) {
    const pm2Env = process.pm2_env;
    const axmMonitor = pm2Env?.axm_monitor;
    const heapSize = axmMonitor?.["Heap Size"];
    const heapUsage = axmMonitor?.["Heap Usage"];
    const heapUsedSize = axmMonitor?.["Used Heap Size"];
    return {
        heapSize,
        heapUsage,
        heapUsedSize,
    };
}
async function waitUntil(condition, intervalMs) {
    await new Promise((resolve) => {
        const check = () => {
            if (condition()) {
                resolve();
                return;
            }
            setTimeout(check, intervalMs);
        };
        check();
    });
}
function formatProcess(process) {
    const pm2Env = process.pm2_env;
    const monit = process.monit;
    return {
        name: process.name,
        pid: process.pid,
        pm_id: process.pm_id,
        status: pm2Env?.status ?? undefined,
        cpu: monit?.cpu,
        memory: monit?.memory,
        restarts: pm2Env?.restart_time ?? 0,
        uptime: pm2Env?.pm_uptime ?? undefined,
        cwd: pm2Env?.cwd ?? undefined,
        createdAt: pm2Env?.created_at ?? undefined,
        outLogPath: pm2Env?.pm_out_log_path ?? undefined,
        errLogPath: pm2Env?.pm_err_log_path ?? undefined,
    };
}
async function executeCommand(command, key) {
    return new Promise((resolve, reject) => {
        pm2_1.default[command](key.toString(), (err) => {
            if (err) {
                reject(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
function getProcessId(process) {
    if (typeof process.pm_id === "number") {
        return process.pm_id.toString();
    }
    if (typeof process.pid === "number") {
        return process.pid.toString();
    }
    return process.name || "unknown";
}
function getProcessStatusCode(process) {
    const rawStatus = process.pm2_env?.status || "";
    const status = rawStatus.toLowerCase();
    if (status === "online") {
        return 1;
    }
    if (status === "stopped" || status === "stopping" || status === "errored") {
        return 0;
    }
    return -1;
}
function getProcessLogPath(process, logType) {
    const formattedProcess = formatProcess(process); // Ensure the process is formatted before accessing log paths
    return logType === "err" ? formattedProcess.errLogPath : formattedProcess.outLogPath;
}
async function uploadFileNewData(pathModel, newContent) {
    try {
        // any type is used to avoid TypeScript errors
        const fs = spinal_core_connectorjs_1.FileSystem.get_inst();
        let path = (0, spinal_core_connectorjs_1.getUrlPath)(fs._protocol, fs._url, fs._port, `?s=${fs._session_num}&p=${pathModel._server_id}`);
        const contentType = pathModel.mimeType ? pathModel.mimeType : "application/octet-stream";
        pathModel.remaining.set(newContent.byteLength);
        await fs._axiosInst.put(path, newContent, {
            headers: {
                "X-Content-Type": contentType,
            },
        });
        pathModel.remaining.set(0);
        return true;
    }
    catch (error) {
        return false;
    }
}
function convertProcessToObject(processes) {
    const processObj = {};
    for (const process of processes) {
        const processId = process.pm_id.get()?.toString() || process.name.get() || "unknown";
        processObj[processId] = process;
    }
    return processObj;
}
function executeIntervalProcessAction(callback, intervalMs) {
    return setInterval(callback, intervalMs);
}
function _initLogPathInHub(processName) {
    const buffer = Buffer.from("empty log file");
    const file = new File([buffer], `${processName}.log`);
    return new spinal_core_connectorjs_1.Path(file);
}
function splitActionResults(result) {
    return result.reduce((acc, res) => {
        if (res.success)
            acc.success.push(res);
        else
            acc.failed.push(res);
        return acc;
    }, { success: [], failed: [] });
}
function partitionResults(result, successKey) {
    const { success, failed } = splitActionResults(result);
    return {
        [successKey]: success,
        failed,
    };
}
//# sourceMappingURL=pm2Utils.js.map
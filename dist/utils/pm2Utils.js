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
exports.getHeapInfo = getHeapInfo;
exports.waitUntil = waitUntil;
exports.formatProcess = formatProcess;
exports.executeCommand = executeCommand;
exports.getProcessLogPath = getProcessLogPath;
exports.uploadFileNewData = uploadFileNewData;
exports.readFileContent = readFileContent;
exports.executeIntervalProcessAction = executeIntervalProcessAction;
exports._initLogPathInHub = _initLogPathInHub;
exports.splitActionResults = splitActionResults;
exports.partitionResults = partitionResults;
exports.generateUniqId = generateUniqId;
exports.getHubDataForProcess = getHubDataForProcess;
exports.hubDataIsValid = hubDataIsValid;
exports.isSameHub = isSameHub;
const pm2_1 = __importDefault(require("pm2"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
// import { Pm2Process } from "../spinal-monitoring-service/models";
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
const systemUtils_1 = require("./systemUtils");
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
function getProcessLogPath(process, logType) {
    const formattedProcess = formatProcess(process); // Ensure the process is formatted before accessing log paths
    return logType === "err" ? formattedProcess.errLogPath : formattedProcess.outLogPath;
}
async function uploadFileNewData(pathModel, newContent) {
    try {
        // console.log(`Uploading new data to path: ${pathModel._server_id}`);
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
async function readFileContent(pathModel) {
    try {
        const fs = spinal_core_connectorjs_1.FileSystem.get_inst();
        let path = (0, spinal_core_connectorjs_1.getUrlPath)(fs._protocol, fs._url, fs._port, `?u=${pathModel._server_id}`);
        const response = await axios_1.default.get(path, { responseType: "text" });
        const content = typeof response.data === "string" ? response.data : String(response.data ?? "");
        return content.split(/\r?\n/);
    }
    catch (error) {
        return null;
    }
}
// export function convertProcessToObject(processes: Pm2Process[]): { [key: string]: Pm2Process } {
// 	const processObj: { [key: string]: Pm2Process } = {};
// 	for (const process of processes) {
// 		const processId = process.pm_id.get()?.toString() || process.name.get() || "unknown";
// 		processObj[processId] = process;
// 	}
// 	return processObj;
// }
function executeIntervalProcessAction(callback, intervalMs) {
    return setInterval(callback, intervalMs);
}
async function _initLogPathInHub(pm2LogPath) {
    const initialData = await fs.promises.readFile(pm2LogPath, "utf8");
    const buffer = Buffer.from(initialData || "");
    return new spinal_core_connectorjs_1.Path(buffer);
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
function generateUniqId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function readEnvFile(filePath) {
    try {
        return (0, dotenv_1.parse)(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return {};
    }
}
function getHubDataForProcess(pm2Process, ipAddress = "") {
    const pm2Env = pm2Process.pm2_env;
    const processCwd = (pm2Env?.pm_cwd ?? pm2Env?.cwd) || "";
    let fileEnvData = readEnvFile(path.join(processCwd, ".env"));
    // const pm2EnvData = pm2Env?.env && typeof pm2Env.env === "object" ? (pm2Env.env as Record<string, unknown>) : {};
    // const envData: Record<string, any> = { ...pm2EnvData, ...fileEnvData };
    const envData = Object.assign({}, pm2Env?.env ?? {}, fileEnvData);
    const hubData = { host: "", port: "", bosName: "" };
    const host_key = ["HUB_HOST", "HUB_IP", "SPINALHUB_IP", "SPINALHUB_HOST", "SPINAL_HUB_HOST", "SPINAL_HUB_IP", "SPINAL_HUB_HOSTNAME", "SPINALHOST", "SPINALIP", "HOST"].map((k) => k.toUpperCase());
    const port_key = ["HUB_PORT", "SPINAL_HUB_PORT", "SPINALHUB_PORT", "HUBPORT", "SPINALHUBPORT", "PORT"].map((k) => k.toUpperCase());
    const name_key = ["HUB_NAME", "SPINAL_HUB_NAME", "SPINALHUB_NAME", "SPINALHUBNAME", "BOS_NAME", "BOSNAME"].map((k) => k.toUpperCase());
    for (const key in envData) {
        const upperKey = key.toUpperCase();
        if (host_key.includes(upperKey) && !hubData.host) {
            let tempIp = String(envData[key]);
            if ((0, systemUtils_1.isLocalAddress)(tempIp))
                tempIp = ipAddress;
            hubData.host = tempIp;
        }
        else if (port_key.includes(upperKey) && !hubData.port) {
            let port = String(envData[key]);
            if (!/^\d+$/.test(port))
                continue; // Skip if port is not a valid number
            if (!port.endsWith("0"))
                port = port.replace(/.$/, "0"); // Ensure the port ends with 0
            hubData.port = port;
        }
        else if (name_key.includes(upperKey) && !hubData.bosName) {
            hubData.bosName = String(envData[key]);
        }
    }
    hubData.bosName || (hubData.bosName = process.env.BOS_NAME || "");
    return hubData;
}
function hubDataIsValid(hubData) {
    return typeof hubData.host === "string" && hubData.host.length > 0 && typeof hubData.port === "string" && /^\d+$/.test(hubData.port);
}
function isSameHub(hubData1, hubData2) {
    return hubData1?.host == hubData2?.host && hubData1?.port == hubData2?.port;
}
//# sourceMappingURL=pm2Utils.js.map
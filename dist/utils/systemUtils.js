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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSystemMetrics = getDefaultSystemMetrics;
exports.isLocalAddress = isLocalAddress;
exports.getIpAddress = getIpAddress;
exports.getHubInfo = getHubInfo;
const os = __importStar(require("os"));
function getDefaultSystemMetrics() {
    return {
        macAddress: "",
        ipAddress: "",
        ramUsage: 0,
        totalRam: 0,
        freeRam: 0,
        cachedRam: 0,
        cpuUsage: 0,
        totalDisk: 0,
        freeDisk: 0,
        diskUsage: 0,
        diskUsagePercent: 0,
    };
}
function isLocalAddress(ipAddress) {
    const localAddresses = ["127.0.0.1", "localhost"];
    return localAddresses.includes(ipAddress);
}
function getIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const iface of Object.values(networkInterfaces)) {
        if (iface) {
            for (const details of iface) {
                if (!details.internal && details.family === "IPv4") {
                    return details.address;
                }
            }
        }
    }
    return "Unknown";
}
function getHubInfo() {
    let host = process.env.SPINALHUB_IP || "";
    let port = process.env.SPINALHUB_PORT || "";
    if (port.length === 0)
        return null;
    if (!port.endsWith("0"))
        port = port.replace(/.$/, "0");
    if (!host)
        return null;
    if (isLocalAddress(host))
        host = getIpAddress();
    return { host, port: Number(port) };
}
//# sourceMappingURL=systemUtils.js.map
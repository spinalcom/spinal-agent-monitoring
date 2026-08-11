"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.getConfig = getConfig;
const path_1 = __importDefault(require("path"));
require("dotenv").config({ path: path_1.default.resolve(__dirname, "../../.env") });
exports.config = {
    spinalConnector: {
        protocol: process.env.SPINALHUB_PROTOCOL, // user id
        user: process.env.SPINAL_USER_ID, // user id
        password: process.env.SPINAL_PASSWORD, // user password
        host: process.env.SPINALHUB_IP, // can be an ip address
        port: process.env.SPINALHUB_PORT, // port
    },
    monitoringApiConfig: {
        organName: process.env.AGENT_NAME,
        serverPort: process.env.SERVER_PORT,
        systemInfoIntervalMs: process.env.SYSTEM_INFO_INTERVAL_MS || 10000, // 10 seconds
        // TokenBosRegister: process.env.TOKEN_BOS_REGISTER,
        // monitoring_url: process.env.MONITORING_URL,
        // monitoring_helath_url: process.env.MONITORING_HEALTH_URL,
        // email: process.env.EMAIL,
        // password: process.env.PASSWORD,
        // grant_type: process.env.GRANT_TYPE,
    },
    zabbixConfig: {
        enabled: process.env.ZABBIX_ENABLED === "true",
        serverHost: process.env.ZABBIX_SERVER_HOST,
        serverPort: process.env.ZABBIX_SERVER_PORT || 10051,
        hostName: process.env.ZABBIX_HOSTNAME || process.env.AGENT_NAME,
        pushIntervalMs: process.env.ZABBIX_PUSH_INTERVAL_MS || 15000,
        retryBaseMs: process.env.ZABBIX_RETRY_BASE_MS || 1000,
        retryMaxMs: process.env.ZABBIX_RETRY_MAX_MS || 30000,
    },
};
function getConfig() {
    return {
        monitoringPath: "/etc/Organs/Monitoring",
        updateInterval: 10000, // 10 secondes
        cpuAlertThreshold: 90, // %
    };
}
exports.default = exports.config;
//# sourceMappingURL=config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._generateZabbixMetrics = _generateZabbixMetrics;
const systemUtils_1 = require("./systemUtils");
const pm2Utils_1 = require("./pm2Utils");
function _generateZabbixMetrics(systemMetrics, pm2Processes, discovery) {
    const metrics = [
        { key: "agent.ping", value: 1 },
        { key: "agent.hostname", value: (0, systemUtils_1.getAgentHostName)() },
        { key: "system.cpu.util", value: Number(systemMetrics.cpu.usedPercent) },
        { key: "vm.memory.size[total]", value: Number(systemMetrics.memory.total) },
        { key: "vm.memory.size[free]", value: Number(systemMetrics.memory.free) },
        { key: "vm.memory.size[used]", value: Number(systemMetrics.memory.used) },
        { key: "vfs.fs.size[/,total]", value: toBytesFromGb(systemMetrics.disk.total) },
        { key: "vfs.fs.size[/,free]", value: toBytesFromGb(systemMetrics.disk.free) },
        { key: "vfs.fs.size[/,used]", value: toBytesFromGb(systemMetrics.disk.used) },
        { key: "pm2.proc.count", value: pm2Processes.length },
        { key: "pm2.discovery", value: JSON.stringify(discovery) },
    ];
    for (const process of pm2Processes) {
        const processId = (0, pm2Utils_1.getProcessId)(process);
        const status = (0, pm2Utils_1.getProcessStatusCode)(process);
        const cpu = Number(process.monit?.cpu || 0);
        const memory = Number(process.monit?.memory || 0);
        metrics.push({ key: `pm2.proc.status[${processId}]`, value: status });
        metrics.push({ key: `pm2.proc.cpu[${processId}]`, value: cpu });
        metrics.push({ key: `pm2.proc.mem[${processId}]`, value: memory });
    }
    return metrics;
}
function toBytesFromGb(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return 0;
    }
    return Math.round(numeric * 1e9);
}
//# sourceMappingURL=zabbixFunctions.js.map
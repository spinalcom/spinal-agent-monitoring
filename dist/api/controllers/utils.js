"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._formatVmNode = _formatVmNode;
exports._formatPm2Process = _formatPm2Process;
exports._formatPm2ProcessMetrics = _formatPm2ProcessMetrics;
exports._getBosData = _getBosData;
exports.getBosNameFromPath = getBosNameFromPath;
function _formatVmNode(vmNode) {
    const info = vmNode.info.get();
    return {
        name: info.name,
        type: info.type,
        staticId: info.id,
        dynamicId: vmNode._server_id,
        macAddress: info.macAddress,
        ipAddress: info.ipAddress,
        port: info.port,
        cpuUsage: info.cpuUsage,
        ramUsagePercent: info.ramUsagePercent,
        ramUsage: info.ramUsage,
        totalRam: info.totalRam,
        freeRam: info.freeRam,
        cachedRam: info.cachedRam,
        totalDisk: info.totalDisk,
        freeDisk: info.freeDisk,
        diskUsage: info.diskUsage,
        diskUsagePercent: info.diskUsagePercent,
        cpuUsagePercent: info.cpuUsagePercent,
        cpuIdle: info.cpuIdle,
        cpuIdlePercent: info.cpuIdlePercent,
    };
}
function _formatPm2Process(pm2Process) {
    const info = pm2Process.info.get();
    return {
        name: info.name,
        staticId: info.staticId,
        dynamicId: info.dynamicId,
        pm_id: info.pm_id,
        pid: info.pid,
        status: info.status,
        restarts: info.restarts,
        uptime: info.uptime,
        heapMemory: info.heapMemory,
        createdAt: info.created_at,
        monit: info.monit,
        cwd: info.cwd,
        outLogPath: info.log?.out || "",
        errLogPath: info.log?.err || "",
        bosData: _getBosData(info),
    };
}
function _formatPm2ProcessMetrics(pm2Process) {
    const info = pm2Process.info.get();
    return {
        name: info.name,
        pm_id: info.pm_id,
        status: info.status,
        cpu: info.monit.cpu,
        memory: info.monit.memory,
        uptime: info.uptime,
        restarts: info.restarts,
    };
}
function _getBosData(info) {
    const bosName = info.hubData?.bosName || getBosNameFromPath(info.cwd);
    return {
        bosName,
        ...(info.hubData || {}),
    };
}
function getBosNameFromPath(path) {
    const splittedPath = path.split("/");
    const spinalcomIndex = splittedPath.findIndex((segment) => segment.toLowerCase() === "spinalcom");
    if (spinalcomIndex !== -1 && spinalcomIndex + 1 < splittedPath.length) {
        return splittedPath[spinalcomIndex + 1];
    }
    return "";
}
//# sourceMappingURL=utils.js.map
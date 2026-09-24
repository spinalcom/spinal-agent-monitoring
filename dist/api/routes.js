"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const MonitoringController_1 = require("./controllers/MonitoringController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const EndpointController_1 = require("./controllers/EndpointController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "HealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "error": { "dataType": "string" },
            "status": { "dataType": "double" },
            "message": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IVMResponse": {
        "dataType": "refObject",
        "properties": {
            "cpuUsage": { "dataType": "string" },
            "ramUsagePercent": { "dataType": "string" },
            "ramUsage": { "dataType": "string" },
            "totalRam": { "dataType": "string" },
            "freeRam": { "dataType": "string" },
            "totalDisk": { "dataType": "string" },
            "freeDisk": { "dataType": "string" },
            "diskUsage": { "dataType": "string" },
            "diskUsagePercent": { "dataType": "string" },
            "name": { "dataType": "string" },
            "type": { "dataType": "string" },
            "staticId": { "dataType": "string" },
            "dynamicId": { "dataType": "union", "subSchemas": [{ "dataType": "double" }, { "dataType": "string" }] },
            "macAddress": { "dataType": "string" },
            "ipAddress": { "dataType": "string" },
            "port": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessResponse": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string" },
            "pid": { "dataType": "double" },
            "pm_id": { "dataType": "double" },
            "status": { "dataType": "string" },
            "cpu": { "dataType": "double" },
            "memory": { "dataType": "double" },
            "uptime": { "dataType": "double" },
            "cwd": { "dataType": "string" },
            "createdAt": { "dataType": "double" },
            "outLogPath": { "dataType": "string" },
            "errLogPath": { "dataType": "string" },
            "restarts": { "dataType": "double" },
            "staticId": { "dataType": "string" },
            "dynamicId": { "dataType": "string" },
            "heapMemory": { "dataType": "any" },
            "monit": { "dataType": "any" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessMetricsResponse": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string" },
            "pm_id": { "dataType": "double" },
            "status": { "dataType": "string" },
            "cpu": { "dataType": "double" },
            "memory": { "dataType": "double" },
            "uptime": { "dataType": "double" },
            "restarts": { "dataType": "double" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2StatusSummaryResponse": {
        "dataType": "refObject",
        "properties": {
            "total": { "dataType": "double", "required": true },
            "online": { "dataType": "double", "required": true },
            "stopped": { "dataType": "double", "required": true },
            "errored": { "dataType": "double", "required": true },
            "other": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessLogsResponse": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string" },
            "pm_id": { "dataType": "double" },
            "tail": { "dataType": "double", "required": true },
            "stdout": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "stderr": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2LogType": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["out"] }, { "dataType": "enum", "enums": ["err"] }, { "dataType": "enum", "enums": ["all"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActionResponse": {
        "dataType": "refObject",
        "properties": {
            "message": { "dataType": "string", "required": true },
            "success": { "dataType": "boolean" },
            "key": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EndpointValueResponse": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "unit": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true }, "currentValue": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }, { "dataType": "boolean" }, { "dataType": "enum", "enums": [null] }], "required": true }, "name": { "dataType": "string", "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EndpointTimeSeriesResponse": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "values": { "dataType": "array", "array": { "dataType": "nestedObjectLiteral", "nestedProperties": { "value": { "dataType": "union", "subSchemas": [{ "dataType": "double" }, { "dataType": "boolean" }], "required": true }, "date": { "dataType": "double", "required": true } } }, "required": true }, "name": { "dataType": "string", "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateMaxDayBody": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "maxDay": { "dataType": "union", "subSchemas": [{ "dataType": "double" }, { "dataType": "string" }], "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "silently-remove-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsMonitoringController_getHealth = {};
    app.get('/monitoring/health', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getHealth)), async function MonitoringController_getHealth(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getHealth, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAllVirtualMachines = {};
    app.get('/monitoring/all_vms', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAllVirtualMachines)), async function MonitoringController_getAllVirtualMachines(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAllVirtualMachines, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAllVirtualMachines',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getVirtualMachine = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getVirtualMachine)), async function MonitoringController_getVirtualMachine(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getVirtualMachine, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getVirtualMachine',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getSystemMetrics = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/system', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getSystemMetrics)), async function MonitoringController_getSystemMetrics(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getSystemMetrics, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getSystemMetrics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getApps = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/apps', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getApps)), async function MonitoringController_getApps(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getApps, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getApps',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAppsMetrics = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/apps/metrics', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppsMetrics)), async function MonitoringController_getAppsMetrics(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppsMetrics, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAppsMetrics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAppsStatusSummary = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/apps/status/summary', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppsStatusSummary)), async function MonitoringController_getAppsStatusSummary(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppsStatusSummary, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAppsStatusSummary',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAppByKey = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/apps/:key', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppByKey)), async function MonitoringController_getAppByKey(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppByKey, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAppByKey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAppMetricsByKey = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/:vmKey/apps/:key/metrics', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppMetricsByKey)), async function MonitoringController_getAppMetricsByKey(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppMetricsByKey, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAppMetricsByKey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_getAppLogsByKey = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        tail: { "default": 100, "in": "query", "name": "tail", "dataType": "double" },
        logType: { "default": "all", "in": "query", "name": "logType", "ref": "Pm2LogType" },
    };
    app.get('/monitoring/:vmKey/apps/:key/logs', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppLogsByKey)), async function MonitoringController_getAppLogsByKey(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppLogsByKey, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getAppLogsByKey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_startApp = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/:vmKey/apps/start', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.startApp)), async function MonitoringController_startApp(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_startApp, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'startApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_stopApp = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/:vmKey/apps/stop', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.stopApp)), async function MonitoringController_stopApp(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_stopApp, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'stopApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_restartApp = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/:vmKey/apps/restart', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.restartApp)), async function MonitoringController_restartApp(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_restartApp, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'restartApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_reloadApp = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/:vmKey/apps/reload', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.reloadApp)), async function MonitoringController_reloadApp(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_reloadApp, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'reloadApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMonitoringController_deleteApp = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/:vmKey/apps/delete', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.deleteApp)), async function MonitoringController_deleteApp(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_deleteApp, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'deleteApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2RamHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/ram/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RamHistoryValue)), async function EndpointController_getPm2RamHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RamHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2RamHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2RamHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/ram/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RamHistoryTimeseries)), async function EndpointController_getPm2RamHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RamHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2RamHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2CpuHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/cpu/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2CpuHistoryValue)), async function EndpointController_getPm2CpuHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2CpuHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2CpuHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2CpuHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/cpu/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2CpuHistoryTimeseries)), async function EndpointController_getPm2CpuHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2CpuHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2CpuHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapSizeHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_size/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapSizeHistoryValue)), async function EndpointController_getPm2HeapSizeHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapSizeHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapSizeHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapSizeHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_size/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapSizeHistoryTimeseries)), async function EndpointController_getPm2HeapSizeHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapSizeHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapSizeHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapUsageHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsageHistoryValue)), async function EndpointController_getPm2HeapUsageHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsageHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapUsageHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapUsageHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsageHistoryTimeseries)), async function EndpointController_getPm2HeapUsageHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsageHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapUsageHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapUsedSizeHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_used_size/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsedSizeHistoryValue)), async function EndpointController_getPm2HeapUsedSizeHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsedSizeHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapUsedSizeHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2HeapUsedSizeHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_used_size/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsedSizeHistoryTimeseries)), async function EndpointController_getPm2HeapUsedSizeHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsedSizeHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2HeapUsedSizeHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2RebootHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/reboot/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RebootHistoryValue)), async function EndpointController_getPm2RebootHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RebootHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2RebootHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2RebootHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/reboot/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RebootHistoryTimeseries)), async function EndpointController_getPm2RebootHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RebootHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2RebootHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2ErroredHistoryValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/errored/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2ErroredHistoryValue)), async function EndpointController_getPm2ErroredHistoryValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2ErroredHistoryValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2ErroredHistoryValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getPm2ErroredHistoryTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/errored/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2ErroredHistoryTimeseries)), async function EndpointController_getPm2ErroredHistoryTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2ErroredHistoryTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getPm2ErroredHistoryTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_updatePm2EndpointMaxDay = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        pm2Key: { "in": "path", "name": "pm2Key", "required": true, "dataType": "string" },
        endpoint: { "in": "path", "name": "endpoint", "required": true, "dataType": "string" },
        body: { "in": "body", "name": "body", "required": true, "ref": "UpdateMaxDayBody" },
    };
    app.post('/monitoring/endpoints/:vmKey/pm2/:pm2Key/:endpoint/timeseries/maxDay', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.updatePm2EndpointMaxDay)), async function EndpointController_updatePm2EndpointMaxDay(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_updatePm2EndpointMaxDay, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'updatePm2EndpointMaxDay',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmCpuUsageValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/cpu_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmCpuUsageValue)), async function EndpointController_getVmCpuUsageValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmCpuUsageValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmCpuUsageValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmCpuUsageTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/cpu_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmCpuUsageTimeseries)), async function EndpointController_getVmCpuUsageTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmCpuUsageTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmCpuUsageTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmRamUsageValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/ram_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmRamUsageValue)), async function EndpointController_getVmRamUsageValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmRamUsageValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmRamUsageValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmRamUsageTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/ram_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmRamUsageTimeseries)), async function EndpointController_getVmRamUsageTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmRamUsageTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmRamUsageTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmDiskUsageValue = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/disk_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmDiskUsageValue)), async function EndpointController_getVmDiskUsageValue(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmDiskUsageValue, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmDiskUsageValue',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_getVmDiskUsageTimeseries = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/:vmKey/vm/disk_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmDiskUsageTimeseries)), async function EndpointController_getVmDiskUsageTimeseries(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmDiskUsageTimeseries, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'getVmDiskUsageTimeseries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsEndpointController_updateVmEndpointMaxDay = {
        vmKey: { "in": "path", "name": "vmKey", "required": true, "dataType": "string" },
        endpoint: { "in": "path", "name": "endpoint", "required": true, "dataType": "string" },
        body: { "in": "body", "name": "body", "required": true, "ref": "UpdateMaxDayBody" },
    };
    app.post('/monitoring/endpoints/:vmKey/vm/:endpoint/timeseries/maxDay', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.updateVmEndpointMaxDay)), async function EndpointController_updateVmEndpointMaxDay(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_updateVmEndpointMaxDay, request, response });
            const controller = new EndpointController_1.EndpointController();
            await templateService.apiHandler({
                methodName: 'updateVmEndpointMaxDay',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
//# sourceMappingURL=routes.js.map
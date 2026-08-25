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
    "ISystemMetrics": {
        "dataType": "refObject",
        "properties": {
            "cpuUsage": { "dataType": "string", "required": true },
            "ramUsage": { "dataType": "string", "required": true },
            "totalRam": { "dataType": "string", "required": true },
            "ramUsagePercent": { "dataType": "string" },
            "freeRam": { "dataType": "string", "required": true },
            "totalDisk": { "dataType": "string", "required": true },
            "freeDisk": { "dataType": "string", "required": true },
            "diskUsage": { "dataType": "string", "required": true },
            "diskUsagePercent": { "dataType": "string" },
            "macAddress": { "dataType": "string" },
            "ipAddress": { "dataType": "string" },
            "port": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] },
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
    "Pm2Discovery": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "data": { "dataType": "array", "array": { "dataType": "nestedObjectLiteral", "nestedProperties": { "{#PMID}": { "dataType": "string", "required": true }, "{#PROCNAME}": { "dataType": "string", "required": true } } }, "required": true } }, "validators": {} },
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
    const argsMonitoringController_getSystemMetrics = {};
    app.get('/monitoring/system', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getSystemMetrics)), async function MonitoringController_getSystemMetrics(request, response, next) {
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
    const argsMonitoringController_getApps = {};
    app.get('/monitoring/apps', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getApps)), async function MonitoringController_getApps(request, response, next) {
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
    const argsMonitoringController_getAppsMetrics = {};
    app.get('/monitoring/apps/metrics', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppsMetrics)), async function MonitoringController_getAppsMetrics(request, response, next) {
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
    const argsMonitoringController_getAppsStatusSummary = {};
    app.get('/monitoring/apps/status/summary', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppsStatusSummary)), async function MonitoringController_getAppsStatusSummary(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/apps/:key', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppByKey)), async function MonitoringController_getAppByKey(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/apps/:key/metrics', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppMetricsByKey)), async function MonitoringController_getAppMetricsByKey(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        tail: { "default": 100, "in": "query", "name": "tail", "dataType": "double" },
        logType: { "default": "all", "in": "query", "name": "logType", "ref": "Pm2LogType" },
    };
    app.get('/monitoring/apps/:key/logs', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getAppLogsByKey)), async function MonitoringController_getAppLogsByKey(request, response, next) {
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
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/apps/start', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.startApp)), async function MonitoringController_startApp(request, response, next) {
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
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/apps/stop', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.stopApp)), async function MonitoringController_stopApp(request, response, next) {
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
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/apps/restart', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.restartApp)), async function MonitoringController_restartApp(request, response, next) {
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
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/apps/reload', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.reloadApp)), async function MonitoringController_reloadApp(request, response, next) {
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
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true } } },
    };
    app.post('/monitoring/apps/delete', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.deleteApp)), async function MonitoringController_deleteApp(request, response, next) {
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
    const argsMonitoringController_runPm2Action = {
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "keys": { "dataType": "array", "array": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }] }, "required": true }, "action": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["start"] }, { "dataType": "enum", "enums": ["stop"] }, { "dataType": "enum", "enums": ["restart"] }, { "dataType": "enum", "enums": ["reload"] }, { "dataType": "enum", "enums": ["delete"] }], "required": true } } },
    };
    app.post('/monitoring/apps/action', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.runPm2Action)), async function MonitoringController_runPm2Action(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_runPm2Action, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'runPm2Action',
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
    const argsMonitoringController_getZabbixDiscovery = {};
    app.get('/monitoring/zabbix/discovery', ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController)), ...((0, runtime_1.fetchMiddlewares)(MonitoringController_1.MonitoringController.prototype.getZabbixDiscovery)), async function MonitoringController_getZabbixDiscovery(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getZabbixDiscovery, request, response });
            const controller = new MonitoringController_1.MonitoringController();
            await templateService.apiHandler({
                methodName: 'getZabbixDiscovery',
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
    const argsEndpointController_getPm2RamHistoryValue = {
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/ram/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RamHistoryValue)), async function EndpointController_getPm2RamHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/ram/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RamHistoryTimeseries)), async function EndpointController_getPm2RamHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/cpu/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2CpuHistoryValue)), async function EndpointController_getPm2CpuHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/cpu/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2CpuHistoryTimeseries)), async function EndpointController_getPm2CpuHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_size/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapSizeHistoryValue)), async function EndpointController_getPm2HeapSizeHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_size/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapSizeHistoryTimeseries)), async function EndpointController_getPm2HeapSizeHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsageHistoryValue)), async function EndpointController_getPm2HeapUsageHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsageHistoryTimeseries)), async function EndpointController_getPm2HeapUsageHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_used_size/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsedSizeHistoryValue)), async function EndpointController_getPm2HeapUsedSizeHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/heap_used_size/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2HeapUsedSizeHistoryTimeseries)), async function EndpointController_getPm2HeapUsedSizeHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/reboot/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RebootHistoryValue)), async function EndpointController_getPm2RebootHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/reboot/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2RebootHistoryTimeseries)), async function EndpointController_getPm2RebootHistoryTimeseries(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
    };
    app.get('/monitoring/endpoints/pm2/:key/errored/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2ErroredHistoryValue)), async function EndpointController_getPm2ErroredHistoryValue(request, response, next) {
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
        key: { "in": "path", "name": "key", "required": true, "dataType": "string" },
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/pm2/:key/errored/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getPm2ErroredHistoryTimeseries)), async function EndpointController_getPm2ErroredHistoryTimeseries(request, response, next) {
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
    const argsEndpointController_getVmCpuUsageValue = {};
    app.get('/monitoring/endpoints/vm/cpu_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmCpuUsageValue)), async function EndpointController_getVmCpuUsageValue(request, response, next) {
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
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/vm/cpu_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmCpuUsageTimeseries)), async function EndpointController_getVmCpuUsageTimeseries(request, response, next) {
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
    const argsEndpointController_getVmRamUsageValue = {};
    app.get('/monitoring/endpoints/vm/ram_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmRamUsageValue)), async function EndpointController_getVmRamUsageValue(request, response, next) {
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
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/vm/ram_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmRamUsageTimeseries)), async function EndpointController_getVmRamUsageTimeseries(request, response, next) {
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
    const argsEndpointController_getVmDiskUsageValue = {};
    app.get('/monitoring/endpoints/vm/disk_usage/value', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmDiskUsageValue)), async function EndpointController_getVmDiskUsageValue(request, response, next) {
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
        startTime: { "in": "query", "name": "startTime", "dataType": "double" },
        endTime: { "in": "query", "name": "endTime", "dataType": "double" },
    };
    app.get('/monitoring/endpoints/vm/disk_usage/timeseries', ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController)), ...((0, runtime_1.fetchMiddlewares)(EndpointController_1.EndpointController.prototype.getVmDiskUsageTimeseries)), async function EndpointController_getVmDiskUsageTimeseries(request, response, next) {
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
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
//# sourceMappingURL=routes.js.map
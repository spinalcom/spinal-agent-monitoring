"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const MonitoringController_1 = require("./controllers/MonitoringController");
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
        },
        "additionalProperties": false,
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
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
//# sourceMappingURL=routes.js.map
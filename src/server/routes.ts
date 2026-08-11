/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MonitoringController } from './controllers/MonitoringController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "HealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"string"},
            "status": {"dataType":"double"},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ISystemMetrics": {
        "dataType": "refObject",
        "properties": {
            "cpuUsage": {"dataType":"string","required":true},
            "ramUsage": {"dataType":"string","required":true},
            "totalRam": {"dataType":"string","required":true},
            "ramUsagePercent": {"dataType":"string"},
            "freeRam": {"dataType":"string","required":true},
            "totalDisk": {"dataType":"string","required":true},
            "freeDisk": {"dataType":"string","required":true},
            "diskUsage": {"dataType":"string","required":true},
            "diskUsagePercent": {"dataType":"string"},
            "macAddress": {"dataType":"string"},
            "ipAddress": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessResponse": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "pid": {"dataType":"double"},
            "pm_id": {"dataType":"double"},
            "status": {"dataType":"string"},
            "cpu": {"dataType":"double"},
            "memory": {"dataType":"double"},
            "uptime": {"dataType":"double"},
            "cwd": {"dataType":"string"},
            "createdAt": {"dataType":"double"},
            "outLogPath": {"dataType":"string"},
            "errLogPath": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActionResponse": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "success": {"dataType":"boolean"},
            "key": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2Discovery": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"data":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"{#PMID}":{"dataType":"string","required":true},"{#PROCNAME}":{"dataType":"string","required":true}}},"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"silently-remove-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsMonitoringController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/monitoring/health',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getHealth)),

            async function MonitoringController_getHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getHealth, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_getSystemMetrics: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/monitoring/system',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getSystemMetrics)),

            async function MonitoringController_getSystemMetrics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getSystemMetrics, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getSystemMetrics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_getApps: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/monitoring/apps',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getApps)),

            async function MonitoringController_getApps(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getApps, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getApps',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_getAppByKey: Record<string, TsoaRoute.ParameterSchema> = {
                key: {"in":"path","name":"key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/apps/:key',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAppByKey)),

            async function MonitoringController_getAppByKey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppByKey, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAppByKey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_startApp: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/apps/start',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.startApp)),

            async function MonitoringController_startApp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_startApp, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'startApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_stopApp: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/apps/stop',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.stopApp)),

            async function MonitoringController_stopApp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_stopApp, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'stopApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_restartApp: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/apps/restart',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.restartApp)),

            async function MonitoringController_restartApp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_restartApp, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'restartApp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonitoringController_getZabbixDiscovery: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/monitoring/zabbix/discovery',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getZabbixDiscovery)),

            async function MonitoringController_getZabbixDiscovery(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getZabbixDiscovery, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getZabbixDiscovery',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

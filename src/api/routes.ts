/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MonitoringController } from './controllers/MonitoringController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EndpointController } from './controllers/EndpointController';
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
    "IVMResponse": {
        "dataType": "refObject",
        "properties": {
            "cpuUsage": {"dataType":"string"},
            "ramUsagePercent": {"dataType":"string"},
            "ramUsage": {"dataType":"string"},
            "totalRam": {"dataType":"string"},
            "freeRam": {"dataType":"string"},
            "totalDisk": {"dataType":"string"},
            "freeDisk": {"dataType":"string"},
            "diskUsage": {"dataType":"string"},
            "diskUsagePercent": {"dataType":"string"},
            "name": {"dataType":"string"},
            "type": {"dataType":"string"},
            "staticId": {"dataType":"string"},
            "dynamicId": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}]},
            "macAddress": {"dataType":"string"},
            "ipAddress": {"dataType":"string"},
            "port": {"dataType":"string"},
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
            "restarts": {"dataType":"double"},
            "staticId": {"dataType":"string"},
            "dynamicId": {"dataType":"string"},
            "heapMemory": {"dataType":"any"},
            "monit": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessMetricsResponse": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "pm_id": {"dataType":"double"},
            "status": {"dataType":"string"},
            "cpu": {"dataType":"double"},
            "memory": {"dataType":"double"},
            "uptime": {"dataType":"double"},
            "restarts": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2StatusSummaryResponse": {
        "dataType": "refObject",
        "properties": {
            "total": {"dataType":"double","required":true},
            "online": {"dataType":"double","required":true},
            "stopped": {"dataType":"double","required":true},
            "errored": {"dataType":"double","required":true},
            "other": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2ProcessLogsResponse": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "pm_id": {"dataType":"double"},
            "tail": {"dataType":"double","required":true},
            "stdout": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "stderr": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pm2LogType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["out"]},{"dataType":"enum","enums":["err"]},{"dataType":"enum","enums":["all"]}],"validators":{}},
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
    "EndpointValueResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"unit":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"currentValue":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"},{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EndpointTimeSeriesResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"values":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"value":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"boolean"}],"required":true},"date":{"dataType":"double","required":true}}},"required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateMaxDayBody": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"maxDay":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"string"}],"required":true}},"validators":{}},
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
        const argsMonitoringController_getAllVirtualMachines: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/monitoring/all_vms',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAllVirtualMachines)),

            async function MonitoringController_getAllVirtualMachines(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAllVirtualMachines, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAllVirtualMachines',
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
        const argsMonitoringController_getVirtualMachine: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getVirtualMachine)),

            async function MonitoringController_getVirtualMachine(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getVirtualMachine, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getVirtualMachine',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/system',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/apps',
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
        const argsMonitoringController_getAppsMetrics: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/apps/metrics',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAppsMetrics)),

            async function MonitoringController_getAppsMetrics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppsMetrics, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAppsMetrics',
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
        const argsMonitoringController_getAppsStatusSummary: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/apps/status/summary',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAppsStatusSummary)),

            async function MonitoringController_getAppsStatusSummary(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppsStatusSummary, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAppsStatusSummary',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                key: {"in":"path","name":"key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/apps/:key',
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
        const argsMonitoringController_getAppMetricsByKey: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                key: {"in":"path","name":"key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/:vmKey/apps/:key/metrics',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAppMetricsByKey)),

            async function MonitoringController_getAppMetricsByKey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppMetricsByKey, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAppMetricsByKey',
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
        const argsMonitoringController_getAppLogsByKey: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                key: {"in":"path","name":"key","required":true,"dataType":"string"},
                tail: {"default":100,"in":"query","name":"tail","dataType":"double"},
                logType: {"default":"all","in":"query","name":"logType","ref":"Pm2LogType"},
        };
        app.get('/monitoring/:vmKey/apps/:key/logs',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.getAppLogsByKey)),

            async function MonitoringController_getAppLogsByKey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_getAppLogsByKey, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'getAppLogsByKey',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/:vmKey/apps/start',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/:vmKey/apps/stop',
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
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/:vmKey/apps/restart',
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
        const argsMonitoringController_reloadApp: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/:vmKey/apps/reload',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.reloadApp)),

            async function MonitoringController_reloadApp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_reloadApp, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'reloadApp',
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
        const argsMonitoringController_deleteApp: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"keys":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true}}},
        };
        app.post('/monitoring/:vmKey/apps/delete',
            ...(fetchMiddlewares<RequestHandler>(MonitoringController)),
            ...(fetchMiddlewares<RequestHandler>(MonitoringController.prototype.deleteApp)),

            async function MonitoringController_deleteApp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonitoringController_deleteApp, request, response });

                const controller = new MonitoringController();

              await templateService.apiHandler({
                methodName: 'deleteApp',
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
        const argsEndpointController_getPm2RamHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/ram/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2RamHistoryValue)),

            async function EndpointController_getPm2RamHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RamHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2RamHistoryValue',
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
        const argsEndpointController_getPm2RamHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/ram/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2RamHistoryTimeseries)),

            async function EndpointController_getPm2RamHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RamHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2RamHistoryTimeseries',
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
        const argsEndpointController_getPm2CpuHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/cpu/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2CpuHistoryValue)),

            async function EndpointController_getPm2CpuHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2CpuHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2CpuHistoryValue',
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
        const argsEndpointController_getPm2CpuHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/cpu/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2CpuHistoryTimeseries)),

            async function EndpointController_getPm2CpuHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2CpuHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2CpuHistoryTimeseries',
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
        const argsEndpointController_getPm2HeapSizeHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_size/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapSizeHistoryValue)),

            async function EndpointController_getPm2HeapSizeHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapSizeHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapSizeHistoryValue',
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
        const argsEndpointController_getPm2HeapSizeHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_size/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapSizeHistoryTimeseries)),

            async function EndpointController_getPm2HeapSizeHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapSizeHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapSizeHistoryTimeseries',
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
        const argsEndpointController_getPm2HeapUsageHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_usage/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapUsageHistoryValue)),

            async function EndpointController_getPm2HeapUsageHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsageHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapUsageHistoryValue',
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
        const argsEndpointController_getPm2HeapUsageHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_usage/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapUsageHistoryTimeseries)),

            async function EndpointController_getPm2HeapUsageHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsageHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapUsageHistoryTimeseries',
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
        const argsEndpointController_getPm2HeapUsedSizeHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_used_size/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapUsedSizeHistoryValue)),

            async function EndpointController_getPm2HeapUsedSizeHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsedSizeHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapUsedSizeHistoryValue',
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
        const argsEndpointController_getPm2HeapUsedSizeHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/heap_used_size/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2HeapUsedSizeHistoryTimeseries)),

            async function EndpointController_getPm2HeapUsedSizeHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2HeapUsedSizeHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2HeapUsedSizeHistoryTimeseries',
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
        const argsEndpointController_getPm2RebootHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/reboot/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2RebootHistoryValue)),

            async function EndpointController_getPm2RebootHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RebootHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2RebootHistoryValue',
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
        const argsEndpointController_getPm2RebootHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/reboot/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2RebootHistoryTimeseries)),

            async function EndpointController_getPm2RebootHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2RebootHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2RebootHistoryTimeseries',
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
        const argsEndpointController_getPm2ErroredHistoryValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/errored/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2ErroredHistoryValue)),

            async function EndpointController_getPm2ErroredHistoryValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2ErroredHistoryValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2ErroredHistoryValue',
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
        const argsEndpointController_getPm2ErroredHistoryTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/pm2/:pm2Key/errored/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getPm2ErroredHistoryTimeseries)),

            async function EndpointController_getPm2ErroredHistoryTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getPm2ErroredHistoryTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getPm2ErroredHistoryTimeseries',
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
        const argsEndpointController_updatePm2EndpointMaxDay: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                pm2Key: {"in":"path","name":"pm2Key","required":true,"dataType":"string"},
                endpoint: {"in":"path","name":"endpoint","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateMaxDayBody"},
        };
        app.post('/monitoring/endpoints/:vmKey/pm2/:pm2Key/:endpoint/timeseries/maxDay',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.updatePm2EndpointMaxDay)),

            async function EndpointController_updatePm2EndpointMaxDay(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_updatePm2EndpointMaxDay, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'updatePm2EndpointMaxDay',
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
        const argsEndpointController_getVmCpuUsageValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/cpu_usage/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmCpuUsageValue)),

            async function EndpointController_getVmCpuUsageValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmCpuUsageValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmCpuUsageValue',
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
        const argsEndpointController_getVmCpuUsageTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/cpu_usage/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmCpuUsageTimeseries)),

            async function EndpointController_getVmCpuUsageTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmCpuUsageTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmCpuUsageTimeseries',
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
        const argsEndpointController_getVmRamUsageValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/ram_usage/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmRamUsageValue)),

            async function EndpointController_getVmRamUsageValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmRamUsageValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmRamUsageValue',
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
        const argsEndpointController_getVmRamUsageTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/ram_usage/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmRamUsageTimeseries)),

            async function EndpointController_getVmRamUsageTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmRamUsageTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmRamUsageTimeseries',
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
        const argsEndpointController_getVmDiskUsageValue: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/disk_usage/value',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmDiskUsageValue)),

            async function EndpointController_getVmDiskUsageValue(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmDiskUsageValue, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmDiskUsageValue',
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
        const argsEndpointController_getVmDiskUsageTimeseries: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                startTime: {"in":"query","name":"startTime","dataType":"double"},
                endTime: {"in":"query","name":"endTime","dataType":"double"},
        };
        app.get('/monitoring/endpoints/:vmKey/vm/disk_usage/timeseries',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.getVmDiskUsageTimeseries)),

            async function EndpointController_getVmDiskUsageTimeseries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_getVmDiskUsageTimeseries, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'getVmDiskUsageTimeseries',
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
        const argsEndpointController_updateVmEndpointMaxDay: Record<string, TsoaRoute.ParameterSchema> = {
                vmKey: {"in":"path","name":"vmKey","required":true,"dataType":"string"},
                endpoint: {"in":"path","name":"endpoint","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateMaxDayBody"},
        };
        app.post('/monitoring/endpoints/:vmKey/vm/:endpoint/timeseries/maxDay',
            ...(fetchMiddlewares<RequestHandler>(EndpointController)),
            ...(fetchMiddlewares<RequestHandler>(EndpointController.prototype.updateVmEndpointMaxDay)),

            async function EndpointController_updateVmEndpointMaxDay(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEndpointController_updateVmEndpointMaxDay, request, response });

                const controller = new EndpointController();

              await templateService.apiHandler({
                methodName: 'updateVmEndpointMaxDay',
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

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

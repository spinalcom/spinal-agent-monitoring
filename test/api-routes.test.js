require("ts-node/register/transpile-only");
require("reflect-metadata");

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { ValidateError } = require("tsoa");

const { RegisterRoutes } = require("../src/api/routes");
const { GraphService } = require("../src/api/services/GraphService");
const EndpointService = require("../src/api/services/EndpointService").default;

function createApp() {
    const app = express();
    app.use(express.json());
    RegisterRoutes(app);

    app.use((err, _req, res, next) => {
        if (err instanceof ValidateError) {
            res.status(400).json({
                message: "Validation Failed",
                details: err?.fields,
            });
            return;
        }

        if (err instanceof Error) {
            res.status(500).json({
                message: "Internal Server Error",
                details: err.message,
            });
            return;
        }

        next();
    });

    app.use((_req, res) => {
        res.status(404).json({ error: "Route not found." });
    });

    return app;
}

async function callRoute(app, method, path, body) {
    const server = app.listen(0);
    try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
            method,
            headers: { "content-type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        return { status: response.status, payload };
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
}

function assertRouteExists(result, routeName) {
    const isDefaultNotFound = result.status === 404 && result.payload && result.payload.error === "Route not found.";
    assert.equal(isDefaultNotFound, false, `Expected route ${routeName} to be registered`);
}

const vmKey = "vm-test";
const pm2Key = "pm2-test";
const endpointMetrics = ["ram", "cpu", "heap_size", "heap_usage", "heap_used_size", "reboot", "errored"];
const vmMetrics = ["cpu_usage", "ram_usage", "disk_usage"];

const monitoringRoutes = [
    { method: "GET", path: "/monitoring/health" },
    { method: "GET", path: "/monitoring/all_vms" },
    { method: "GET", path: `/monitoring/${vmKey}` },
    { method: "GET", path: `/monitoring/${vmKey}/system` },
    { method: "GET", path: `/monitoring/${vmKey}/apps` },
    { method: "GET", path: `/monitoring/${vmKey}/apps/metrics` },
    { method: "GET", path: `/monitoring/${vmKey}/apps/status/summary` },
    { method: "GET", path: `/monitoring/${vmKey}/apps/${pm2Key}` },
    { method: "GET", path: `/monitoring/${vmKey}/apps/${pm2Key}/metrics` },
    { method: "GET", path: `/monitoring/${vmKey}/apps/${pm2Key}/logs?tail=10&logType=all` },
    { method: "POST", path: `/monitoring/${vmKey}/apps/start`, body: { keys: [pm2Key] } },
    { method: "POST", path: `/monitoring/${vmKey}/apps/stop`, body: { keys: [pm2Key] } },
    { method: "POST", path: `/monitoring/${vmKey}/apps/restart`, body: { keys: [pm2Key] } },
    { method: "POST", path: `/monitoring/${vmKey}/apps/reload`, body: { keys: [pm2Key] } },
    { method: "POST", path: `/monitoring/${vmKey}/apps/delete`, body: { keys: [pm2Key] } },
];

const endpointRoutes = [
    ...endpointMetrics.flatMap((metric) => [
        { method: "GET", path: `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/${metric}/value` },
        { method: "GET", path: `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/${metric}/timeseries?startTime=1&endTime=2` },
    ]),
    { method: "POST", path: `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/ram/timeseries/maxDay`, body: { maxDay: 7 } },
    ...vmMetrics.flatMap((metric) => [
        { method: "GET", path: `/monitoring/endpoints/${vmKey}/vm/${metric}/value` },
        { method: "GET", path: `/monitoring/endpoints/${vmKey}/vm/${metric}/timeseries?startTime=1&endTime=2` },
    ]),
    { method: "POST", path: `/monitoring/endpoints/${vmKey}/vm/cpu_usage/timeseries/maxDay`, body: { maxDay: 7 } },
];

const allRoutes = [...monitoringRoutes, ...endpointRoutes];

for (const route of allRoutes) {
    test(`${route.method} ${route.path}`, async () => {
        const app = createApp();
        const result = await callRoute(app, route.method, route.path, route.body);
        assertRouteExists(result, `${route.method} ${route.path}`);
    });
}

async function withPatchedGraphService(overrides, callback) {
    const graphService = GraphService.getInstance();
    const originals = {};

    for (const key of Object.keys(overrides)) {
        originals[key] = graphService[key];
        graphService[key] = overrides[key];
    }

    try {
        await callback();
    } finally {
        for (const key of Object.keys(overrides)) {
            graphService[key] = originals[key];
        }
    }
}

async function withPatchedEndpointService(overrides, callback) {
    const endpointService = EndpointService.getInstance();
    const originals = {};

    for (const key of Object.keys(overrides)) {
        originals[key] = endpointService[key];
        endpointService[key] = overrides[key];
    }

    try {
        await callback();
    } finally {
        for (const key of Object.keys(overrides)) {
            endpointService[key] = originals[key];
        }
    }
}

function createVmNode(overrides = {}) {
    const info = {
        name: "vm-name",
        type: "vm",
        id: "vm-static-id",
        macAddress: "00:11:22:33:44:55",
        ipAddress: "127.0.0.1",
        port: "3000",
        cpuUsage: "10",
        ramUsagePercent: "50",
        ramUsage: "4GB",
        totalRam: "8GB",
        freeRam: "4GB",
        totalDisk: "100GB",
        freeDisk: "60GB",
        diskUsage: "40GB",
        diskUsagePercent: "40",
        ...overrides,
    };

    return {
        _server_id: 123,
        info: {
            get: () => info,
        },
    };
}

function createPm2ProcessNode(overrides = {}) {
    const info = {
        name: "app-1",
        staticId: "pm2-static",
        dynamicId: "pm2-dynamic",
        pm_id: 1,
        status: "online",
        restarts: 2,
        uptime: 1000,
        heapMemory: { heapSize: { value: 100 } },
        monit: { cpu: 12, memory: 2048 },
        cwd: "/srv/app",
        created_at: 1700000000000,
        log: { outLogPath: "/tmp/out.log", errLogPath: "/tmp/err.log" },
        ...overrides,
    };

    return {
        info: {
            get: () => info,
        },
    };
}

function createEndpointNode({ id = "endpoint-id", name = "endpoint-name", currentValue = 1, unit = "%" } = {}) {
    return {
        getId: () => ({ get: () => id }),
        getName: () => ({ get: () => name }),
        getElement: async () => ({
            currentValue: { get: () => currentValue },
            unit: { get: () => unit },
        }),
    };
}

test("business: GET /monitoring/health returns status ok", async () => {
    const app = createApp();
    const result = await callRoute(app, "GET", "/monitoring/health");

    assert.equal(result.status, 200);
    assert.deepEqual(result.payload, { status: "ok" });
});

test("business: POST /monitoring/:vmKey/apps/start partitions action results", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
            executeCommand: async (_vm, _action, keys) =>
                keys.map((key, index) => ({
                    key,
                    success: index % 2 === 0,
                    message: index % 2 === 0 ? "ok" : "failed",
                })),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "POST", `/monitoring/${vmKey}/apps/start`, { keys: ["pm2-a", "pm2-b"] });

            assert.equal(result.status, 200);
            assert.equal(Array.isArray(result.payload.started), true);
            assert.equal(Array.isArray(result.payload.failed), true);
            assert.equal(result.payload.started.length, 1);
            assert.equal(result.payload.failed.length, 1);
            assert.equal(result.payload.started[0].key, "pm2-a");
            assert.equal(result.payload.failed[0].key, "pm2-b");
        },
    );
});

test("business: POST pm2 maxDay rejects invalid body", async () => {
    const app = createApp();
    const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/ram/timeseries/maxDay`, { maxDay: 0 });

    assert.equal(result.status, 400);
    assert.equal(result.payload.error, "maxDay is required and must be a number greater than 0");
});

test("business: GET vm timeseries rejects invalid range", async () => {
    const app = createApp();
    const result = await callRoute(app, "GET", `/monitoring/endpoints/${vmKey}/vm/cpu_usage/timeseries?startTime=10&endTime=1`);

    assert.equal(result.status, 400);
    assert.equal(result.payload.error, "Invalid time range: startTime must be lower than endTime");
});

test("business: GET pm2 timeseries rejects invalid range", async () => {
    const app = createApp();
    const result = await callRoute(app, "GET", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/cpu/timeseries?startTime=20&endTime=10`);

    assert.equal(result.status, 400);
    assert.equal(result.payload.error, "Invalid time range: startTime must be lower than endTime");
});

test("business: POST /monitoring/:vmKey/apps/start returns 400 when command fails", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
            executeCommand: async () => {
                throw new Error("pm2 start failed");
            },
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "POST", `/monitoring/${vmKey}/apps/start`, { keys: ["pm2-a"] });

            assert.equal(result.status, 400);
            assert.equal(result.payload.error, "pm2 start failed");
        },
    );
});

test("business: GET app by key returns 404 when process is missing", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
            getPm2ProcessNodeByKey: async () => null,
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/${pm2Key}`);

            assert.equal(result.status, 404);
            assert.equal(result.payload.error, `Process '${pm2Key}' not found.`);
        },
    );
});

test("business: GET app logs returns 404 when logs are unavailable", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
            getPm2ProcessNodeByKey: async () => ({ id: "process-node" }),
            getPm2ProcessLogsByKey: async () => null,
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/${pm2Key}/logs?tail=10&logType=all`);

            assert.equal(result.status, 404);
            assert.equal(result.payload.error, `Process '${pm2Key}' not found.`);
        },
    );
});

test("business: POST pm2 maxDay validates required body field", async () => {
    const app = createApp();
    const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/ram/timeseries/maxDay`, {});

    assert.equal(result.status, 400);
    assert.equal(result.payload.message, "Validation Failed");
});

test("business: POST pm2 maxDay rejects unknown endpoint", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
            getPm2ProcessNodeByKey: async () => ({ id: "process-node" }),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/unknown/timeseries/maxDay`, { maxDay: 3 });

            assert.equal(result.status, 400);
            assert.equal(result.payload.error, "Unknown PM2 endpoint 'unknown'.");
        },
    );
});

test("business: POST vm maxDay rejects unknown endpoint", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/vm/unknown/timeseries/maxDay`, { maxDay: 3 });

            assert.equal(result.status, 400);
            assert.equal(result.payload.error, "Unknown endpoint 'unknown'.");
        },
    );
});

test("business: POST vm maxDay updates endpoint on success", async () => {
    let updateCalled = false;

    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
        },
        async () => {
            await withPatchedEndpointService(
                {
                    getEndpointByName: async () => ({ id: "endpoint-node" }),
                    updateEndpointMaxDay: async () => {
                        updateCalled = true;
                    },
                },
                async () => {
                    const app = createApp();
                    const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/vm/cpu_usage/timeseries/maxDay`, { maxDay: 5 });

                    assert.equal(result.status, 200);
                    assert.equal(result.payload.success, true);
                    assert.equal(updateCalled, true);
                },
            );
        },
    );
});

test("business: GET vm endpoint value returns expected payload shape", async () => {
    const fakeEndpointNode = createEndpointNode({ id: "endpoint-id", name: "cpu_usage", currentValue: 42, unit: "%" });

    await withPatchedGraphService(
        {
            getVirtualMachine: async () => ({ id: "vm" }),
        },
        async () => {
            await withPatchedEndpointService(
                {
                    getEndpointByName: async () => fakeEndpointNode,
                },
                async () => {
                    const app = createApp();
                    const result = await callRoute(app, "GET", `/monitoring/endpoints/${vmKey}/vm/cpu_usage/value`);

                    assert.equal(result.status, 200);
                    assert.deepEqual(result.payload, {
                        id: "endpoint-id",
                        name: "cpu_usage",
                        currentValue: 42,
                        unit: "%",
                    });
                },
            );
        },
    );
});

test("contract: GET /monitoring/all_vms returns VM array schema", async () => {
    await withPatchedGraphService(
        {
            getAllVirtualMachines: async () => [createVmNode()],
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", "/monitoring/all_vms");

            assert.equal(result.status, 200);
            assert.equal(Array.isArray(result.payload), true);
            assert.equal(result.payload.length, 1);
            assert.equal(result.payload[0].name, "vm-name");
            assert.equal(result.payload[0].dynamicId, 123);
            assert.equal(typeof result.payload[0].cpuUsage, "string");
        },
    );
});

test("contract: GET /monitoring/:vmKey returns VM schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode({ name: "vm-single" }),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}`);

            assert.equal(result.status, 200);
            assert.equal(result.payload.name, "vm-single");
            assert.equal(result.payload.type, "vm");
            assert.equal(result.payload.staticId, "vm-static-id");
        },
    );
});

test("contract: GET /monitoring/:vmKey/apps returns PM2 process schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessesNodes: async () => [createPm2ProcessNode()],
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps`);

            assert.equal(result.status, 200);
            assert.equal(Array.isArray(result.payload), true);
            assert.equal(result.payload[0].name, "app-1");
            assert.equal(result.payload[0].pm_id, 1);
            assert.equal(result.payload[0].status, "online");
            assert.equal(typeof result.payload[0].monit, "object");
        },
    );
});

test("contract: GET /monitoring/:vmKey/apps/metrics returns metrics schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessesNodes: async () => [createPm2ProcessNode()],
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/metrics`);

            assert.equal(result.status, 200);
            assert.equal(Array.isArray(result.payload), true);
            assert.equal(result.payload[0].pm_id, 1);
            assert.equal(result.payload[0].status, "online");
            assert.equal(typeof result.payload[0].monit.cpu, "number");
        },
    );
});

test("contract: GET /monitoring/:vmKey/apps/status/summary aggregates statuses", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessesNodes: async () => [
                createPm2ProcessNode({ status: "online" }),
                createPm2ProcessNode({ status: "online", pm_id: 2 }),
                createPm2ProcessNode({ status: "stopped", pm_id: 3 }),
            ],
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/status/summary`);

            assert.equal(result.status, 200);
            assert.equal(result.payload.online, 2);
            assert.equal(result.payload.stopped, 1);
        },
    );
});

test("contract: GET /monitoring/:vmKey/apps/:key/metrics returns metrics schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessNodeByKey: async () => createPm2ProcessNode(),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/${pm2Key}/metrics`);

            assert.equal(result.status, 200);
            assert.equal(result.payload.name, "app-1");
            assert.equal(result.payload.pm_id, 1);
            assert.equal(typeof result.payload.cpu, "number");
            assert.equal(typeof result.payload.memory, "number");
        },
    );
});

test("contract: GET /monitoring/:vmKey/apps/:key/logs forwards query and returns logs", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessNodeByKey: async () => createPm2ProcessNode(),
            getPm2ProcessLogsByKey: async (_processNode, tail, logType) => ({
                name: "app-1",
                pm_id: 1,
                tail,
                stdout: logType === "err" ? [] : ["line-out"],
                stderr: ["line-err"],
            }),
        },
        async () => {
            const app = createApp();
            const result = await callRoute(app, "GET", `/monitoring/${vmKey}/apps/${pm2Key}/logs?tail=25&logType=err`);

            assert.equal(result.status, 200);
            assert.equal(result.payload.tail, 25);
            assert.deepEqual(result.payload.stdout, []);
            assert.deepEqual(result.payload.stderr, ["line-err"]);
        },
    );
});

const actionSuccessField = {
    stop: "stopped",
    restart: "restarted",
    reload: "reloaded",
    delete: "deleted",
};

for (const action of ["stop", "restart", "reload", "delete"]) {
    test(`contract: POST /monitoring/:vmKey/apps/${action} returns grouped result`, async () => {
        await withPatchedGraphService(
            {
                getVirtualMachine: async () => createVmNode(),
                executeCommand: async (_vm, _action, keys) => keys.map((key) => ({ key, success: true, message: "ok" })),
            },
            async () => {
                const app = createApp();
                const result = await callRoute(app, "POST", `/monitoring/${vmKey}/apps/${action}`, { keys: ["a1", "a2"] });

                assert.equal(result.status, 200);
                assert.equal(Array.isArray(result.payload.failed), true);
                const successField = actionSuccessField[action];
                assert.equal(Array.isArray(result.payload[successField]), true);
                assert.equal(result.payload[successField].length, 2);
            },
        );
    });
}

test("contract: GET PM2 endpoint timeseries returns values array schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessNodeByKey: async () => ({ id: "pm2-node" }),
        },
        async () => {
            await withPatchedEndpointService(
                {
                    getEndpointByName: async () => createEndpointNode({ id: "pm2-endpoint", name: "cpu_history" }),
                    getEndpointsTimeSeries: async () => [
                        { date: 1, value: 10 },
                        { date: 2, value: 20 },
                    ],
                },
                async () => {
                    const app = createApp();
                    const result = await callRoute(app, "GET", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/cpu/timeseries?startTime=1&endTime=3`);

                    assert.equal(result.status, 200);
                    assert.equal(result.payload.id, "pm2-endpoint");
                    assert.equal(result.payload.name, "cpu_history");
                    assert.equal(Array.isArray(result.payload.values), true);
                    assert.deepEqual(result.payload.values[0], { date: 1, value: 10 });
                },
            );
        },
    );
});

test("contract: GET VM endpoint timeseries returns values array schema", async () => {
    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
        },
        async () => {
            await withPatchedEndpointService(
                {
                    getEndpointByName: async () => createEndpointNode({ id: "vm-endpoint", name: "cpu_usage" }),
                    getEndpointsTimeSeries: async () => [{ date: 10, value: 55 }],
                },
                async () => {
                    const app = createApp();
                    const result = await callRoute(app, "GET", `/monitoring/endpoints/${vmKey}/vm/cpu_usage/timeseries?startTime=1&endTime=100`);

                    assert.equal(result.status, 200);
                    assert.equal(result.payload.id, "vm-endpoint");
                    assert.equal(result.payload.name, "cpu_usage");
                    assert.deepEqual(result.payload.values, [{ date: 10, value: 55 }]);
                },
            );
        },
    );
});

test("contract: POST pm2 maxDay updates endpoint on success", async () => {
    let updateCalled = false;

    await withPatchedGraphService(
        {
            getVirtualMachine: async () => createVmNode(),
            getPm2ProcessNodeByKey: async () => ({ id: "pm2-node" }),
        },
        async () => {
            await withPatchedEndpointService(
                {
                    getEndpointByName: async () => createEndpointNode({ id: "pm2-endpoint", name: "ram_history" }),
                    updateEndpointMaxDay: async () => {
                        updateCalled = true;
                    },
                },
                async () => {
                    const app = createApp();
                    const result = await callRoute(app, "POST", `/monitoring/endpoints/${vmKey}/pm2/${pm2Key}/ram/timeseries/maxDay`, { maxDay: 9 });

                    assert.equal(result.status, 200);
                    assert.equal(result.payload.success, true);
                    assert.equal(updateCalled, true);
                },
            );
        },
    );
});

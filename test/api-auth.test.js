require("ts-node/register/transpile-only");

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const jwt = require("jsonwebtoken");

const UserService = require("../src/api/services/UserService").default;
const { SpinalApiMiddleware } = require("../src/api/middleware/SpinalApiMiddleware");
const { AuthController } = require("../src/api/controllers/AuthController");
const { InitSwagger } = require("../src/api/swagger");
const { RegisterRoutes } = require("../src/api/routes");

function createGraphProvider() {
    let usersContext = null;
    const userNodes = [];
    const graph = {
        async getContext(name) {
            return name === "users" ? usersContext : null;
        },
        async addContext(context) {
            usersContext = context;
            context._server_id = 1;
            context.getChildren = async (relationName) => relationName === "hasUsers" ? userNodes : [];
            context.addChildInContext = async (node, relationName) => {
                assert.equal(relationName, "hasUsers");
                node._server_id = userNodes.length + 2;
                userNodes.push(node);
                return node;
            };
        },
    };

    return { getGraph: () => graph, getUserNodes: () => userNodes };
}

test("admin initialization creates credentials and protects API routes with bearer tokens", async () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "spinal-agent-auth-"));
    const credentialsPath = path.join(temporaryDirectory, ".admin.log");
    const previousJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-jwt-secret-with-at-least-thirty-two-bytes";

    try {
        const graphProvider = createGraphProvider();
        const userService = new UserService(graphProvider, credentialsPath);
        await userService.initialize();

        const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
        const [storedAdmin] = graphProvider.getUserNodes();
        assert.equal(credentials.username, "admin");
        assert.equal(typeof credentials.password, "string");
        assert.ok(credentials.password.length > 0);
        assert.equal(fs.statSync(credentialsPath).mode & 0o777, 0o600);
        assert.equal(storedAdmin.info.username.get(), "admin");
        assert.notEqual(storedAdmin.info.passwordHash.get(), credentials.password);
        assert.equal(storedAdmin.info.jwtSecret, undefined);
        assert.equal(storedAdmin.info.password, undefined);

        fs.unlinkSync(credentialsPath);
        const login = await userService.login("admin", credentials.password);
        assert.ok(login);
        assert.equal(login.token.split(".").length, 3);
        assert.equal(userService.isTokenValid(login.token), true);
        const tamperedToken = `${login.token.slice(0, -1)}${login.token.endsWith("a") ? "b" : "a"}`;
        assert.equal(userService.isTokenValid(tamperedToken), false);
        const expiredToken = jwt.sign({ sub: "admin" }, process.env.JWT_SECRET, {
            algorithm: "HS256",
            audience: "spinal-agent-monitoring-api",
            expiresIn: -1,
            issuer: "spinal-agent-monitoring",
        });
        assert.equal(userService.isTokenValid(expiredToken), false);
        assert.equal(await userService.login("admin", "incorrect-password"), null);

        const restartedUserService = new UserService(graphProvider, credentialsPath);
        await restartedUserService.initialize();
        assert.equal(fs.existsSync(credentialsPath), false);
        assert.equal(restartedUserService.isTokenValid(login.token), true);
        assert.ok(await restartedUserService.login("admin", credentials.password));

        const originalGetInstance = UserService.getInstance;
        UserService.getInstance = () => userService;
        let loginResponse;
        try {
            loginResponse = await new AuthController().login({ username: "admin", password: credentials.password });
        } finally {
            UserService.getInstance = originalGetInstance;
        }
        assert.equal(loginResponse.tokenType, "Bearer");
        assert.equal(loginResponse.expiresIn, 8 * 60 * 60);
        assert.equal(userService.isTokenValid(loginResponse.token), true);

        const middlewareUserService = UserService.getInstance;
        UserService.getInstance = () => userService;
        const app = express();
        app.use(SpinalApiMiddleware.checkMonitoringToken);
        InitSwagger(app);
        app.get("/monitoring/private", (_req, res) => res.json({ ok: true }));
        app.get("/monitoring/health", (_req, res) => res.json({ status: "ok" }));

        const server = app.listen(0);
        try {
            const { port } = server.address();
            const unauthorized = await fetch(`http://127.0.0.1:${port}/monitoring/private`);
            assert.equal(unauthorized.status, 401);

            const authorized = await fetch(`http://127.0.0.1:${port}/monitoring/private`, {
                headers: { authorization: `Bearer ${login.token}` },
            });
            assert.equal(authorized.status, 200);
            assert.deepEqual(await authorized.json(), { ok: true });

            const health = await fetch(`http://127.0.0.1:${port}/monitoring/health`);
            assert.equal(health.status, 200);

            const swaggerSpecification = await fetch(`http://127.0.0.1:${port}/monitoring/swagger.json`);
            assert.equal(swaggerSpecification.status, 200);
            const specification = await swaggerSpecification.json();
            assert.equal(specification.openapi, "3.0.0");
            assert.equal(specification.components.securitySchemes.jwt.scheme, "bearer");
            assert.deepEqual(specification.paths["/monitoring/all_vms"].get.security, [{ jwt: [] }]);
            assert.deepEqual(specification.paths["/monitoring/health"].get.security, []);
            assert.deepEqual(specification.paths["/auth/login"].post.security, []);

            const swaggerUi = await fetch(`http://127.0.0.1:${port}/monitoring/api-docs/`);
            assert.equal(swaggerUi.status, 200);
            assert.match(await swaggerUi.text(), /swagger-ui/);
        } finally {
            await new Promise((resolve) => server.close(resolve));
            UserService.getInstance = middlewareUserService;
        }
    } finally {
        if (previousJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousJwtSecret;
        }
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
});

test("SpinalApiMiddleware protects API routes while leaving health and Swagger public", async () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "spinal-agent-tsoa-auth-"));
    const previousJwtSecret = process.env.JWT_SECRET;
    const originalGetInstance = UserService.getInstance;
    process.env.JWT_SECRET = "test-jwt-secret-with-at-least-thirty-two-bytes";

    try {
        const userService = new UserService(createGraphProvider(), path.join(temporaryDirectory, ".admin.log"));
        await userService.initialize();
        const credentials = JSON.parse(fs.readFileSync(path.join(temporaryDirectory, ".admin.log"), "utf8"));
        const login = await userService.login("admin", credentials.password);
        assert.ok(login);

        UserService.getInstance = () => userService;
        const app = express();
        app.use(express.json());
        app.use(SpinalApiMiddleware.checkMonitoringToken);
        InitSwagger(app);
        RegisterRoutes(app);

        const server = app.listen(0);
        try {
            const { port } = server.address();
            const unauthorized = await fetch(`http://127.0.0.1:${port}/monitoring/all_vms`);
            assert.equal(unauthorized.status, 401);

            const invalidToken = await fetch(`http://127.0.0.1:${port}/monitoring/all_vms`, {
                headers: { authorization: "Bearer invalid-token" },
            });
            assert.equal(invalidToken.status, 401);

            const authorized = await fetch(`http://127.0.0.1:${port}/monitoring/all_vms`, {
                headers: { authorization: `Bearer ${login.token}` },
            });
            assert.notEqual(authorized.status, 401);

            const publicLogin = await fetch(`http://127.0.0.1:${port}/auth/login`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ username: "admin", password: credentials.password }),
            });
            assert.equal(publicLogin.status, 200);

            const health = await fetch(`http://127.0.0.1:${port}/monitoring/health`);
            assert.equal(health.status, 200);

            const swaggerSpecification = await fetch(`http://127.0.0.1:${port}/monitoring/swagger.json`);
            assert.equal(swaggerSpecification.status, 200);
            const specification = await swaggerSpecification.json();
            assert.equal(specification.openapi, "3.0.0");
            const operations = Object.values(specification.paths).flatMap((path) =>
                Object.values(path).filter((operation) => operation && typeof operation === "object" && operation.responses),
            );
            assert.ok(operations.every((operation) => Array.isArray(operation.tags) && operation.tags.length === 1));
            assert.deepEqual(
                [...new Set(operations.flatMap((operation) => operation.tags))].sort(),
                ["Authentication", "pm2", "timeSeries", "vm"],
            );

            const swaggerUi = await fetch(`http://127.0.0.1:${port}/monitoring/api-docs/`);
            assert.equal(swaggerUi.status, 200);
            assert.match(await swaggerUi.text(), /swagger-ui/);
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    } finally {
        UserService.getInstance = originalGetInstance;
        if (previousJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousJwtSecret;
        }
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
});

test("admin initialization generates and persists JWT_SECRET when it is missing", async () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "spinal-agent-auth-"));
    const credentialsPath = path.join(temporaryDirectory, ".admin.log");
    const environmentPath = path.join(temporaryDirectory, ".env");
    const previousJwtSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
        const userService = new UserService(createGraphProvider(), credentialsPath, environmentPath);
        await userService.initialize();

        const generatedSecret = process.env.JWT_SECRET;
        const envContents = fs.readFileSync(environmentPath, "utf8");
        const storedSecret = envContents.match(/^JWT_SECRET=([a-f0-9]{128})$/m);
        assert.ok(generatedSecret);
        assert.ok(storedSecret && storedSecret[1] === generatedSecret);
        assert.equal(fs.statSync(environmentPath).mode & 0o777, 0o600);
    } finally {
        if (previousJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousJwtSecret;
        }
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
});

test("admin initialization requires a sufficiently long JWT_SECRET", async () => {
    const previousJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "short";

    try {
        const userService = new UserService(createGraphProvider());
        await assert.rejects(userService.initialize(), /JWT_SECRET must be configured with at least 32 bytes/);
    } finally {
        if (previousJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousJwtSecret;
        }
    }
});

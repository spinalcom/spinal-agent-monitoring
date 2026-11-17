# spinal-organ-monitoring

### API authentication

On startup, the agent generates a cryptographically random `JWT_SECRET` and stores it in `.env` if it is missing. A configured secret must contain at least 32 bytes.

The secret is used to sign and verify Bearer JWTs and is not stored in `.admin.log` or in the graph.

The `SpinalApiMiddleware.checkMonitoringToken` method validates bearer tokens for protected API routes. Swagger UI and the Swagger specification remain public; use **Authorize** in Swagger UI to sign in with the credentials from `.admin.log`. Swagger exchanges those credentials for a JWT through `/auth/login`. `/monitoring/health` and `/auth/login` remain public.

### Notes

The agent continues to collect system metrics and PM2 process data for SpinalHub and its API.
# spinal-organ-monitoring

## Zabbix V1

This project now includes a first Zabbix integration layer:

- periodic metric push using native Zabbix TCP trapper protocol
- PM2 low-level discovery payload (LLD)
- API endpoint for discovery: `GET /zabbix/discovery`

### Required environment variables

Add these values in your `.env` file:

```env
ZABBIX_ENABLED=true
ZABBIX_SERVER_HOST=127.0.0.1
ZABBIX_SERVER_PORT=10051
ZABBIX_HOSTNAME=my-agent-host
ZABBIX_PUSH_INTERVAL_MS=15000
ZABBIX_RETRY_BASE_MS=1000
ZABBIX_RETRY_MAX_MS=30000
```

### API authentication

On startup, the agent generates a cryptographically random `JWT_SECRET` and stores it in `.env` if it is missing. A configured secret must contain at least 32 bytes.

The secret is used to sign and verify Bearer JWTs and is not stored in `.admin.log` or in the graph.

The `SpinalApiMiddleware.checkMonitoringToken` method validates bearer tokens for protected API routes. `/auth/login`, `/monitoring/health`, Swagger UI, and the Swagger specification remain public.

### Notes

- The agent sends data using native Zabbix TCP trapper protocol on port `10051`.
- If `ZABBIX_ENABLED=true` and `ZABBIX_SERVER_HOST` is missing, the sender is not started.
- The sender performs buffered retries with exponential backoff when pushes fail.

### PM2 metrics exported

- `pm2.proc.count`
- `pm2.proc.status[<id>]`
- `pm2.proc.cpu[<id>]`
- `pm2.proc.mem[<id>]`
- `pm2.discovery` (JSON LLD payload)

### WebSocket event for Zabbix push

Clients can subscribe to Zabbix push updates by sending:

```json
{ "type": "zabbixPush" }
```

Then they will receive:

```json
{
	"type": "zabbixPush",
	"data": {
		"status": "success",
		"transport": "sender",
		"host": "my-agent-host",
		"metricsCount": 14,
		"timestamp": 1780000000,
		"metrics": [{ "key": "agent.ping", "value": 1 }]
	}
}
```

### System metrics exported

- `agent.ping`
- `agent.hostname`
- `system.cpu.util`
- `vm.memory.size[total|free|used]`
- `vfs.fs.size[/,total|free|used]`
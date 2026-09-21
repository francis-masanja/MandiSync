# Phase 5 – Monitoring & Operations

## Objectives
Add production‑grade observability, alerting, and runbooks to keep the service reliable.

## Tasks

| # | Task | Details | Effort |
|---|------|---------|--------|
| 5.1 | **Metrics collection** | Vercel Analytics (auto) or custom metrics via `@vercel/analytics`. Track page views, API latency, error rate, queue size, offline buffer count. | 0.5 day |
| 5.2 | **Structured logging** | Add Pino (or Winston) logger to the API middleware. JSON output with `correlation_id`, `user_id`, `route`, `method`, `status`, `duration_ms`. | 0.5 day |
| 5.3 | **Ops runbook** | Create `docs/ops/runbook.md` covering alert thresholds, common issues, debugging steps, escalation contacts. | 0.5 day |
| 5.4 | **Uptime monitoring** | GitHub Actions cron job (or external service) that calls `/api/health` every 5 min and raises a GitHub Issue on failure. | 0.5 day |

## Key Metrics to Track
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API latency (p95) | < 500 ms | > 2 s |
| Error rate | < 0.1 % | > 1 % |
| Queue size | < 50 | > 100 |
| DB connection pool usage | < 80 % | > 90 % |
| Offline buffer size | 0 | > 100 unsynced |

## Structured Logging Example (Pino)
```ts
import pino from "pino";
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  base: { pid: process.pid },
  timestamp: pino.stdTimeFunctions.isoTime
});

export async function loggingMiddleware(req: NextRequest, next: () => Promise<NextResponse>) {
  const start = Date.now();
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const res = await next();
  const duration = Date.now() - start;
  logger.info({
    correlation_id: correlationId,
    method: req.method,
    url: req.nextUrl.pathname,
    status: res.status,
    duration_ms: duration,
    user_id: req.cookies.get("session")?.value ?? null,
  });
  return res;
}
```
Add this middleware to `app/api/v1/_middleware.ts`.

## Ops Runbook (`docs/ops/runbook.md`)
```markdown
# MandiSync Operations Runbook

## Alert Thresholds
- **API latency > 2 s** (p95) → investigate DB load, network latency.
- **Error rate > 1 %** → check recent deployments, logs for stack traces.
- **Queue size > 100** → possible blockage at gate verification; verify device connectivity.
- **Offline buffer > 100** → devices are not syncing; check Wi‑Fi, API key validity.

## Common Issues & Debug Steps
1. **Gate verification failing**
   - Verify ESP32 is online (device list UI).
   - Check API key validity (compare hash in `devices` table).
   - Inspect `telemetry_logs` for the failing request.
2. **Weighbridge data not appearing**
   - Ensure HX711 JSON payload is received (Web Serial log).
   - Confirm `POST /api/v1/telemetry/weighbridge` returns `200`.
   - Verify DB transaction did not roll back (check logs).
3. **High latency**
   - Review recent DB queries (use `EXPLAIN` on heavy SELECTs).
   - Check Vercel function cold starts; consider `functions` config.
4. **Offline buffer growing**
   - Ping device IP; ensure Wi‑Fi connectivity.
   - Rotate API key if a device was compromised.

## Escalation
- **Primary**: @devops (Slack: #mandisync‑ops)
- **Secondary**: @backend‑lead
- **On‑call**: PagerDuty rotation (link)

## Mitigation Scripts
```bash
# Flush stale offline buffers (run in a safe window)
npm run db:flush-offline-buffers
```
```

---

## Uptime Monitoring (GitHub Actions)
Create `.github/workflows/uptime.yml`:
```yaml
name: Uptime Monitor
on:
  schedule:
    - cron: "*/5 * * * *"  # every 5 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://your-deployment.vercel.app/api/health)
          if [ "$STATUS" -ne 200 ]; then
            echo "Health check failed with $STATUS"
            gh issue create --title "⚠️ MandiSync health check failed" \
              --body "Health endpoint returned $STATUS at $(date)" \
              --repo ${{ github.repository }}
          fi
``` 
This workflow creates a GitHub issue when the health endpoint is unhealthy.

# Deploying MandiSync to Vercel

MandiSync runs on Vercel with no database, using the in-memory demo dataset.
That is the recommended first deployment.

## 1. Import the project

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   install command `npm install`, output `.next` — all defaults.
4. Node.js version: **20.9 or newer** (Vercel default is fine).

`postinstall` runs `prisma generate`, so the Prisma client exists on a fresh
install even when no database is used.

## 2. Environment variables

Set these in **Project → Settings → Environment Variables** (Production and
Preview):

| Variable | Value | Required |
|---|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | **Yes** |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` | **Yes** |
| `DATABASE_URL` | leave unset or empty | No |
| `TURSO_AUTH_TOKEN` | leave unset or empty | No |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` | Optional (social metadata) |

`NEXTAUTH_URL` must be the exact public URL, including `https://`. After the
first deploy, update it if Vercel assigns a different domain.

Do not copy `.env.example` into Vercel: its `NEXTAUTH_SECRET` is a placeholder
and `NEXTAUTH_URL` points at localhost.

## 3. Demo logins

The demo accounts are bundled from `data/users.json`:

| Role | Email | Password |
|---|---|---|
| Farmer | `farmer@example.com` | `farmer123` |
| Operator | `operator@example.com` | `operator123` |
| Admin | `admin@example.com` | `admin123` |

## What works without a database

- Login with the demo accounts above.
- Farmer, gate, queue and admin pages.
- Bookings, gate verification and weighbridge telemetry **for the lifetime of
  a serverless instance**. Vercel may spin up several instances and recycle
  them, so data is not durable and different users may see different state.

Sign-up returns **503** on Vercel because the filesystem is read-only. This is
expected. Sign-up works locally, where `data/users.json` is writable.

## Optional: persistent storage with Turso

Only do this if you need data to survive cold starts and be shared across
instances.

1. Create a Turso database and copy its `libsql://` URL and auth token.
2. Apply the schema:
   ```bash
   DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx prisma migrate deploy
   ```
3. Seed the demo users:
   ```bash
   DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx scripts/seed-turso.ts
   ```
4. Add `DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel and redeploy.

Caveat: the Prisma path expects `Mandi` and `Slot` rows to exist. Only users
are seeded by the current scripts, so run the in-memory mode for a demo until
mandi/slot seeding is added. Login reads `data/users.json` first and falls back
to the database.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Login says "Invalid email or password" for demo accounts | `data/users.json` is missing from the deployment; make sure it is committed. |
| Everyone is logged out after a deploy | `NEXTAUTH_SECRET` is missing or changed. |
| Callback/session errors after login | `NEXTAUTH_URL` does not match the deployed URL. |
| `PrismaClientInitializationError` | `DATABASE_URL` is set but empty/invalid, or migrations were not applied. Leave it unset for demo mode. |
| Sign-up returns 503 | Expected on Vercel's read-only filesystem. |

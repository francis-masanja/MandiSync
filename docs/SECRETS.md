# 🔐 MandiSync Secret Rotation Guide

This document describes the procedures for rotating secrets in MandiSync. **Follow these steps whenever a secret is compromised or on a scheduled rotation.**

---

## 📋 Secret Inventory

| Secret | Environment Variable | Rotation Frequency | Stored In |
|--------|---------------------|-------------------|-----------|
| HMAC Master Secret | `MANDI_HMAC_SECRET` | 90 days / on compromise | Vercel / Railway / Docker secrets |
| NextAuth Secret | `NEXTAUTH_SECRET` | 90 days / on compromise | Vercel / Railway / Docker secrets |
| Turso Auth Token | `TURSO_AUTH_TOKEN` | 90 days / on compromise | Vercel / Railway / Docker secrets |
| Turso Database URL | `TURSO_DATABASE_URL` | On migration only | Vercel / Railway / Docker secrets |
| Ollama API Key | `OLLAMA_API_KEY` | On compromise | Vercel / Railway / Docker secrets |

---

## 🔴 Emergency Rotation (Compromise)

**If any secret is exposed publicly (GitHub, logs, shared accidentally):**

### 1. Immediate Actions (within 1 hour)
```bash
# 1. Generate new secret
openssl rand -base64 32  # For NEXTAUTH_SECRET, MANDI_HMAC_SECRET
openssl rand -hex 32     # For Turso tokens (Turso expects hex)

# 2. Update in deployment platform (Vercel/Railway/Docker)
#    - Go to project settings → Environment Variables
#    - Replace old value with new
#    - Redeploy

# 3. Invalidate existing sessions (NextAuth)
#    - Change NEXTAUTH_SECRET → all JWTs invalidated
#    - Users will be logged out automatically
```

### 2. HMAC Secret Rotation (MANDI_HMAC_SECRET)
```bash
# 1. Generate new secret
NEW_HMAC=$(openssl rand -base64 32)

# 2. Update in deployment platform
#    Vercel: vercel env add MANDI_HMAC_SECRET production
#    Railway: railway variables set MANDI_HMAC_SECRET=$NEW_HMAC

# 3. Regenerate ALL gate pass HMACs
#    Run script to re-sign all active bookings:
#    npm run hmac:regenerate  # Create this script if needed

# 4. Redeploy
vercel --prod
# or
railway up
```

### 3. Turso Token Rotation
```bash
# 1. In Turso Dashboard → Database → Settings → Tokens
#    - Click "Create New Token"
#    - Copy new token

# 2. Update deployment platform
railway variables set TURSO_AUTH_TOKEN=<new-token>
# or
vercel env add TURSO_AUTH_TOKEN production

# 3. Redeploy
railway up
```

### 4. NextAuth Secret Rotation
```bash
# 1. Generate new secret
NEW_NEXTAUTH=$(openssl rand -base64 32)

# 2. Update in deployment platform
railway variables set NEXTAUTH_SECRET=$NEW_NEXTAUTH

# 3. All users will be logged out on next request (expected)
#    Notify users if needed
```

---

## 📅 Scheduled Rotation (Quarterly)

| Date | Secret | Owner |
|------|--------|-------|
| Jan 1 | MANDI_HMAC_SECRET | Backend Lead |
| Apr 1 | NEXTAUTH_SECRET | Backend Lead |
| Jul 1 | TURSO_AUTH_TOKEN | DevOps |
| Oct 1 | OLLAMA_API_KEY | AI Engineer |

**Procedure:**
1. Generate new secret using `openssl rand -base64 32`
2. Update in deployment platform (Vercel/Railway)
3. Trigger deployment
4. Verify application works
5. Update password manager (1Password/Bitwarden)
6. Log rotation in audit log

---

## 🛡️ Rotation Checklist

### Pre-Rotation
- [ ] Notify team of scheduled rotation
- [ ] Generate new secret
- [ ] Update password manager entry
- [ ] Schedule maintenance window (if needed)

### During Rotation
- [ ] Update secret in deployment platform
- [ ] Trigger deployment
- [ ] Verify application health
- [ ] Run smoke tests

### Post-Rotation
- [ ] Verify all services healthy
- [ ] Update password manager
- [ ] Log rotation in audit log
- [ ] Notify team of completion

---

## 🚨 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Security Lead | — | — |
| Backend Lead | — | — |
| DevOps | — | — |

---

## 📝 Audit Log

| Date | Secret | Reason | Rotated By | Verified By |
|------|--------|--------|------------|-------------|
| 2026-01-15 | MANDI_HMAC_SECRET | Initial setup | — | — |
| 2026-01-15 | NEXTAUTH_SECRET | Initial setup | — | — |
| 2026-01-15 | TURSO_AUTH_TOKEN | Initial setup | — | — |

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `lib/crypto.ts` | Uses `MANDI_HMAC_SECRET` for HMAC generation |
| `lib/env.ts` | Reads all environment variables |
| `app/api/auth/[...nextauth]/route.ts` | Uses `NEXTAUTH_SECRET` |
| `lib/db.ts` | Uses `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| `lib/ai.ts` | Uses `OLLAMA_API_KEY` |

---

## ⚠️ Critical Reminders

1. **NEVER** commit secrets to git (`.env` is in `.gitignore`)
2. **NEVER** log secrets (check log output)
3. **ALWAYS** use `process.env` — never hardcode
4. **ALWAYS** rotate on compromise, not just schedule
5. **VERIFY** after rotation: test gate pass, login, DB connection

---

*Last updated: 2026-01-15*
*Next review: 2026-04-15*
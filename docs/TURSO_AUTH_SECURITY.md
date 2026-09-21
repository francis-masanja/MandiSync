# Turso Authentication & Security Guide

## Overview

This document covers the authentication mechanisms for Turso (libSQL) database connections and the security measures implemented to protect tokens.

## Current Implementation: Static Auth Token

### How it Works

The current implementation uses a **static auth token** embedded in the `DATABASE_URL`:

```bash
DATABASE_URL="libsql://your-db-name.your-org.turso.io?authToken=YOUR_AUTH_TOKEN"
```

### Security Characteristics

| Aspect | Details |
|--------|---------|
| **Transport** | TLS 1.2+ (HTTPS/WSS) - all connections encrypted |
| **Token Scope** | Database-level read/write only, no admin privileges |
| **Rotation** | Manual via script (`npm run rotate:turso-token`) |
| **Revocation** | Via Turso dashboard or API |
| **Expiration** | Configurable when creating token (optional) |

### Risk Assessment

**Pros:**
- Simple to implement and understand
- Standard libSQL authentication pattern
- Token can be rotated without schema changes
- No additional infrastructure required

**Cons:**
- Token visible in connection string (logs, process env)
- Static until manually rotated
- If leaked, attacker has full DB read/write access
- No built-in short-lived token rotation

---

## Recommended: Turso JWT Authentication (Future Upgrade)

Turso supports **JWT-based authentication** which provides:

| Feature | Benefit |
|---------|---------|
| **Short-lived tokens** | 1-hour default TTL, auto-refreshed |
| **No static token in URL** | Connection string uses `authType=jwt` |
| **Scoped permissions** | Can limit to specific tables/operations |
| **Automatic rotation** | Client handles token refresh |
| **Audit trail** | Each request tied to JWT claims |

### Migration Path

When ready to upgrade:

1. **Enable JWT auth in Turso Dashboard**
   - Database → Settings → Authentication → Enable JWT

2. **Update Prisma adapter configuration**
   ```typescript
   // lib/prisma.ts
   const libsql = createClient({
     url: process.env.DATABASE_URL!, // Without authToken
     authToken: async () => await getJwtToken(), // Custom JWT provider
   });
   ```

3. **Implement JWT token provider**
   ```typescript
   // lib/turso-jwt.ts
   import { createClient } from '@libsql/client';
   
   async function getJwtToken(): Promise<string> {
     // Use Turso's JWT endpoint or your own JWT issuer
     const response = await fetch('https://api.turso.io/v1/auth/jwt', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}` },
     });
     return (await response.json()).token;
   }
   ```

4. **Update DATABASE_URL format**
   ```bash
   # Old (static token)
   DATABASE_URL="libsql://db-org.turso.io?authToken=xxx"
   
   # New (JWT auth)
   DATABASE_URL="libsql://db-org.turso.io?authType=jwt"
   ```

---

## Token Rotation Procedure

### Automated Rotation Script

Run weekly via cron:

```bash
# Add to crontab (runs Sundays at 2 AM)
0 2 * * 0 cd /path/to/project && npm run rotate:turso-token >> /var/log/turso-rotation.log 2>&1
```

### Manual Rotation Steps

1. **Run the rotation script:**
   ```bash
   npm run rotate:turso-token
   ```

2. **Update environment variables** with new `DATABASE_URL`

3. **Deploy/restart application**

4. **Verify application works** with new token

5. **Revoke old token** via Turso Dashboard → Database → Tokens

### Required Environment Variables for Rotation

```bash
# Turso API credentials (org-level)
TURSO_API_TOKEN="your-org-api-token"
TURSO_ORG_NAME="your-org-name"
TURSO_DATABASE_NAME="your-db-name"
```

---

## Security Checklist

### ✅ Implemented
- [x] TLS enforcement (all connections HTTPS/WSS)
- [x] CSP headers preventing XSS token leakage
- [x] Rate limiting on auth routes (5 req/min/IP)
- [x] Secure, HttpOnly, SameSite cookies in production
- [x] CSRF protection via NextAuth
- [x] bcrypt password hashing (cost 10)
- [x] Token rotation script with audit trail
- [x] `.gitignore` prevents `.env` commit

### 🔄 Recommended Enhancements
- [ ] Upgrade to Turso JWT authentication
- [ ] Add request/response logging (without auth headers)
- [ ] Implement IP allowlisting for admin routes
- [ ] Add database audit logging
- [ ] Set up monitoring/alerts for failed auth attempts
- [ ] Consider VPC peering for production Turso instances

---

## Network Security Verification

### TLS Verification
All external connections use TLS:
- ✅ Turso/libSQL: `libsql://` (TLS 1.2+)
- ✅ NextAuth: HTTPS in production
- ✅ Ollama: Configure `OLLAMA_BASE_URL` with `https://`
- ✅ CSP `connect-src` restricts to known endpoints

### Token Exposure Prevention
| Token | Exposure Risk | Mitigation |
|-------|---------------|------------|
| Turso auth token | In `DATABASE_URL` (process env) | Never logged, rotated periodically |
| NextAuth secret | Server-only | Never sent to client |
| NextAuth JWT | HttpOnly cookie | `secure`, `httpOnly`, `sameSite=lax` |
| Ollama API key | Authorization header | Only sent to configured `OLLAMA_BASE_URL` |
| HMAC tokens | Stored in DB | Verified server-side, never transmitted |

---

## Incident Response

### If Turso Token is Compromised

1. **Immediately revoke** the token in Turso Dashboard
2. **Generate new token** via rotation script
3. **Update DATABASE_URL** in all environments
4. **Deploy/restart** all affected services
5. **Audit database access logs** for suspicious activity
6. **Rotate related secrets** (NextAuth secret, Ollama API key)

### If NextAuth Secret is Compromised

1. **Generate new secret:** `openssl rand -base64 32`
2. **Update NEXTAUTH_SECRET** in all environments
3. **Deploy/restart** - all existing sessions invalidated
4. **Notify users** to re-login

---

## Compliance Notes

- **Data at rest**: Turso encrypts data at rest (AES-256)
- **Data in transit**: All connections use TLS 1.2+
- **Access control**: Database-scoped tokens, no root access
- **Audit**: Turso provides access logs via dashboard/API
- **Retention**: Configure token expiration per policy (e.g., 90 days)
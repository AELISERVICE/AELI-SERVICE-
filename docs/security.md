# 🔐 API Security

Security management, logs, and attack protection.

## Base URL (Admin)
```
/api/admin
```

> 💡 **i18n**: Add `?lang=en` for English messages. See [README](./README.md#-internationalization-i18n).

---

## Endpoints

### GET `/security-logs` - Security Logs 🔒

⚠️ **Required Role:** `admin`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | int | Number of logs (default: 100) |
| `eventType` | string | Event type |
| `riskLevel` | string | `low`, `medium`, `high` |
| `userId` | uuid | Filter by user |
| `success` | bool | Successful/failed events |
| `startDate` | date | Start date |
| `endDate` | date | End date |

**Event Types:**
| Type | Description |
|------|-------------|
| `login_success` | Successful login |
| `login_failed` | Failed login |
| `account_locked` | Account locked |
| `otp_verified` | OTP verified |
| `otp_failed` | OTP failed |
| `honeypot_triggered` | Bot detected |
| `password_reset_request` | Password reset request |
| `session_expired` | Session expired |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "eventType": "login_failed",
        "ipAddress": "192.168.1.1",
        "email": "user@example.com",
        "userAgent": "Mozilla/5.0...",
        "riskLevel": "medium",
        "success": false,
        "details": {},
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### GET `/security-logs/export` - Export to CSV 🔒

⚠️ **Required Role:** `admin`

Downloads security logs in CSV format.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `startDate` | date | Start date (default: -30 days) |
| `endDate` | date | End date (default: today) |
| `eventType` | string | Filter by type |
| `riskLevel` | string | Filter by risk level |

**Response:** Downloaded CSV file

---

### GET `/security-stats` - Security Statistics 🔒

⚠️ **Required Role:** `admin`

Real-time dashboard of security events.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "hourlyFailedAttempts": 12,
    "dailyFailedAttempts": 47,
    "highRiskEvents24h": 3,
    "activeBannedIPs": 5,
    "topSuspiciousIPs": [
      { "ipAddress": "192.168.1.100", "count": 15 },
      { "ipAddress": "10.0.0.50", "count": 8 }
    ]
  }
}
```

---

### GET `/banned-ips` - Banned IPs 🔒

⚠️ **Required Role:** `admin`

List of currently banned IPs.

---

### POST `/banned-ips` - Ban an IP 🔒

⚠️ **Required Role:** `admin`

**Body:**
```json
{
  "ipAddress": "192.168.1.100",
  "reason": "Brute force attack",
  "duration": 86400
}
```

| Field | Description |
|-------|-------------|
| `duration` | Duration in seconds (`null` = permanent) |

---

### DELETE `/banned-ips/:ip` - Unban an IP 🔒

⚠️ **Required Role:** `admin`

---

## Active Protections

### 🛡️ Brute Force Protection

| Protection | Configuration |
|------------|---------------|
| Login | 5 attempts / 15 min |
| OTP | 3 attempts / 10 min |
| Password Reset | 3 / hour |
| Registration | 5 / hour |
| Contact | 10 / hour |
| General API | 100 / minute |

### 🔒 Account Lockout

```
After 5 failed login attempts:
├── Account locked for 30 minutes
├── "account_locked" event logged
└── Email notification (optional)
```

### 🤖 Bot Detection (Honeypot)

```
Honeypot fields in forms:
├── website
├── hp_check  
└── url2

If filled:
├── Request rejected (400)
├── "honeypot_triggered" event logged (high risk)
└── Auto-ban after 10+ suspicious events
```

### 🚫 Auto-Ban IP

```
If 10+ suspicious events in 1 hour:
├── IP automatically banned for 24h
├── Cache immediately invalidated
└── Logged in security_logs
```

---

## Security Headers

| Header | Value |
|--------|--------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Content-Security-Policy | default-src 'self' |
| Strict-Transport-Security | max-age=31536000 |

---

## Security Workflow

### Login with Protection

```
[User] POST /api/auth/login
{ email, password }
    │
    ▼
┌─────────────────────────┐
│ IP Banlist Check        │ ── Banned ──▶ 403 Access Denied
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Rate Limit (5/15min)    │ ── Exceeded ──▶ 429 Too Many Requests
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Account Lock Check      │ ── Locked ──▶ 423 Account Locked
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Validation credentials  │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │           │
   OK         FAILED
    │           │
    ▼           ▼
┌────────┐  ┌─────────────┐
│ Login  │  │ Increment   │
│ Success│  │ failedLogin │
│ Log    │  │ attempts    │
└────────┘  └──────┬──────┘
                   │
                   ▼
            ┌──────────────┐
            │ 5 failures?  │
            └──────┬───────┘
                   │ Yes
                   ▼
            ┌──────────────┐
            │ LOCK 30 min  │
            │ Log event    │
            └──────────────┘
```

---

## Security Emails

| Event | Template |
|-------|----------|
| Password changed | `passwordChangedConfirmationEmail` |
| Password forgotten | `passwordResetEmail` |
| Account deactivated | `accountDeactivatedEmail` |

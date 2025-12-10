# Security Implementation Guide

## 🔐 Security Features Implemented

### 1. **Server-Side Authentication**
- ✅ Password verification moved to server
- ✅ Bcrypt password hashing (10 rounds)
- ✅ No hardcoded passwords in client code
- ✅ Environment variable configuration

### 2. **Rate Limiting**
- ✅ Max 5 failed attempts per IP
- ✅ 15-minute sliding window
- ✅ 30-minute block after max attempts
- ✅ Automatic cleanup of old entries
- ✅ HTTP 429 status for rate-limited requests

### 3. **CORS Protection**
- ✅ Whitelist-based origin validation
- ✅ Different configs for dev/production
- ✅ Configurable via environment variables

### 4. **HTTPS Enforcement**
- ✅ Automatic HTTP to HTTPS redirect (production only)
- ✅ HSTS header (1 year, includeSubDomains)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

### 5. **Additional Security Headers**
- ✅ Strict-Transport-Security
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install bcrypt @types/bcrypt
```

### 2. Generate Password Hash

For production, generate a secure password hash:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourSecurePassword123!', 10).then(hash => console.log(hash));"
```

### 3. Update Environment Variables

#### Development (`.env`):
```env
ADMIN_PASSWORD='Acun97'
ADMIN_PASSWORD_HASH='$2b$10$...'
ALLOWED_ORIGINS='http://localhost:5000,http://localhost:5173'
```

#### Production (`.env.production` or hosting platform):
```env
ADMIN_PASSWORD_HASH='$2b$10$YourGeneratedHashHere'
ALLOWED_ORIGINS='https://yourdomain.com,https://www.yourdomain.com'
```

### 4. Update CORS Origins

In `.env.production`, replace with your actual domain:

```env
ALLOWED_ORIGINS='https://route-mvm.vercel.app,https://www.route-mvm.vercel.app'
```

---

## 📝 API Endpoints

### Authentication

**POST** `/api/auth/verify`

Request:
```json
{
  "password": "your-password"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

Error Response (401):
```json
{
  "success": false,
  "message": "Incorrect password"
}
```

Rate Limited Response (429):
```json
{
  "message": "Too many failed attempts. Please try again later.",
  "retryAfter": 1800
}
```

---

## 🔧 Configuration Options

### Rate Limiting
Edit `server/auth.ts`:
```typescript
const MAX_ATTEMPTS = 5;              // Max failed attempts
const WINDOW_MS = 15 * 60 * 1000;    // 15 minutes window
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block
```

### Password Hashing
Rounds of hashing (higher = more secure but slower):
```typescript
bcrypt.hash(password, 10); // 10 rounds (recommended)
```

---

## 🛡️ Security Best Practices

### ✅ DO:
1. Use strong passwords (12+ characters, mixed case, numbers, symbols)
2. Generate unique password hash for production
3. Keep `.env` files in `.gitignore`
4. Use HTTPS in production
5. Whitelist only trusted domains in CORS
6. Regularly rotate passwords
7. Monitor failed authentication attempts

### ❌ DON'T:
1. Commit `.env` files to git
2. Use default passwords in production
3. Allow `*` in CORS for production
4. Share password hashes publicly
5. Use HTTP in production
6. Hardcode passwords in code

---

## 🔍 Testing

### Test Authentication:
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"Acun97"}'
```

### Test Rate Limiting:
Make 6+ failed attempts within 15 minutes and verify 429 response.

### Test CORS:
```bash
curl -H "Origin: https://malicious-site.com" \
  http://localhost:5000/api/table-rows
```
Should be blocked in production mode.

---

## 📊 Security Audit Checklist

- [x] Password stored as hash (bcrypt)
- [x] Rate limiting implemented
- [x] CORS restricted to whitelist
- [x] HTTPS enforced in production
- [x] Security headers added
- [x] No sensitive data in client code
- [x] Environment variables for secrets
- [x] Input validation (Zod schemas)
- [x] SQL injection protected (Drizzle ORM)

---

## 🆘 Troubleshooting

### Issue: "Authentication failed"
- Check if `ADMIN_PASSWORD_HASH` is set in environment
- Verify password hash is correctly generated
- Check server logs for detailed error

### Issue: "Too many attempts"
- Wait for block duration (30 minutes)
- Or restart server to clear in-memory rate limit store

### Issue: CORS error in production
- Add your domain to `ALLOWED_ORIGINS`
- Ensure HTTPS is used
- Check browser console for exact origin being blocked

---

## 📚 References

- [Bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [HTTPS Enforcement](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

---

## 🔄 Migration from Old System

The old hardcoded password system has been completely replaced. No migration needed for existing data.

**Before:** Password hardcoded in `client/src/components/password-prompt.tsx`
```typescript
const correctPassword = "Acun97"; // ❌ INSECURE
```

**After:** Server-side verification with bcrypt
```typescript
const isValid = await verifyPassword(password); // ✅ SECURE
```

---

## 📞 Support

For security issues or questions, please contact the development team.

**Last Updated:** December 10, 2025

import bcrypt from 'bcrypt';

// Store for rate limiting - simple in-memory store
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes after max attempts

/**
 * Clean up old entries from rate limit store
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (now - entry.lastAttempt > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  });
}

// Run cleanup every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000);

/**
 * Check if IP is rate limited
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // Check if IP is currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > WINDOW_MS) {
    rateLimitStore.delete(ip);
    return { allowed: true };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfter = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Record failed authentication attempt
 */
export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    rateLimitStore.set(ip, {
      attempts: 1,
      lastAttempt: now,
    });
  } else {
    entry.attempts++;
    entry.lastAttempt = now;
  }
}

/**
 * Reset rate limit for IP (on successful auth)
 */
export function resetRateLimit(ip: string) {
  rateLimitStore.delete(ip);
}

/**
 * Verify password against hash from environment
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  
  if (!passwordHash) {
    console.error('ADMIN_PASSWORD_HASH not configured in environment');
    return false;
  }

  try {
    // For development, also allow plain text password from env
    if (process.env.NODE_ENV === 'development' && process.env.ADMIN_PASSWORD) {
      if (password === process.env.ADMIN_PASSWORD) {
        return true;
      }
    }

    // Verify against bcrypt hash
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate password hash (utility for creating hashes)
 */
export async function generatePasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Change admin password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  // Verify current password first
  const isValid = await verifyPassword(currentPassword);
  if (!isValid) {
    return false;
  }

  // Generate new hash
  const newHash = await generatePasswordHash(newPassword);
  
  // In production, you would update the hash in your secure storage
  // For now, we'll just log it - you need to manually update .env.production
  console.log('New password hash (update in .env.production):');
  console.log(newHash);
  
  return true;
}

import { Pool, neonConfig, type PoolConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure fetch for Neon (required for serverless environments)
neonConfig.fetchConnectionCache = true;

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function initDb() {
  if (_db) return _db;
  
  // For development, use in-memory mode if DATABASE_URL not set
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  DATABASE_URL not set. Running in development mode without database.');
      console.warn('⚠️  Data will not persist. Set DATABASE_URL for full functionality.');
      return null as any; // Return null but typed as db for development
    }
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000, // Increased timeout to 10s
    idleTimeoutMillis: 30000,
    max: 1, // Limit connections in serverless environment
  };
  
  _pool = new Pool(poolConfig);
  
  // Add error handlers for the pool
  _pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });
  
  _db = drizzle({ client: _pool, schema });
  
  return _db;
}

export function getDb() {
  if (!_db) {
    return initDb();
  }
  return _db;
}

// Lazy getters for backward compatibility
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (!_pool) initDb();
    return (_pool as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) initDb();
    return (_db as any)[prop];
  }
});

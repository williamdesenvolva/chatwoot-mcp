import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/chatwoot_mcp';
const POOL_SIZE = parseInt(process.env.DATABASE_POOL_SIZE || '10', 10);

// Create connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: POOL_SIZE,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});

// Initialize database (run migrations)
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('[DB] Initializing database...');

    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrations', '001_initial.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    await client.query(migrationSQL);
    console.log('[DB] Migration 001_initial.sql executed successfully');

    // Check if master user exists, if not create it
    const masterEmail = process.env.MASTER_USER_EMAIL || 'admin@desenvolva.io';
    const masterPassword = process.env.MASTER_USER_PASSWORD || 'admin123456';

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [masterEmail]
    );

    if (existingUser.rows.length === 0) {
      // Import bcrypt dynamically to hash password
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(masterPassword, 12);

      await client.query(
        `INSERT INTO users (email, password_hash, name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [masterEmail, passwordHash, 'Master Admin', 'superadmin', true]
      );

      console.log(`[DB] Master user created: ${masterEmail}`);
    } else {
      console.log(`[DB] Master user already exists: ${masterEmail}`);
    }

    console.log('[DB] Database initialization complete');
  } catch (error) {
    console.error('[DB] Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Query helper with error handling
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('[DB] Slow query:', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('[DB] Query error:', { text, error });
    throw error;
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('[DB] Database pool closed');
}

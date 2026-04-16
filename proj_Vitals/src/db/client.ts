import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('vitals.db');

export const db = drizzle(expoDb, { schema });

/**
 * Perform manual migrations or initialization if needed.
 * For development, 'drizzle-kit push' is often used.
 * In production, you would use 'migrate' with generated migration files.
 */
export async function initializeDatabase() {
  // Add migration logic here if needed
  // await migrate(db, { migrationsFolder: './drizzle' });
}

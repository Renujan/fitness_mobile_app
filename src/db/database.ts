import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import { seedDatabaseIfEmpty } from './seed';

const DATABASE_NAME = 'fittrack.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Execute schema statements
      await db.execAsync(CREATE_TABLES_SQL);

      // Seed starter datasets if empty
      await seedDatabaseIfEmpty(db);

      dbInstance = db;
      return db;
    } catch (error) {
      console.error('Failed to initialize FitTrack SQLite database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Reset all database tables (used for Settings -> Reset Data)
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS achievements;
    DROP TABLE IF EXISTS fitness_goals;
    DROP TABLE IF EXISTS progress_photos;
    DROP TABLE IF EXISTS body_measurements;
    DROP TABLE IF EXISTS food_logs;
    DROP TABLE IF EXISTS food_items;
    DROP TABLE IF EXISTS workout_sets;
    DROP TABLE IF EXISTS workout_sessions;
    DROP TABLE IF EXISTS workout_plans;
    DROP TABLE IF EXISTS exercises;
    DROP TABLE IF EXISTS user_profile;
  `);

  await db.execAsync(CREATE_TABLES_SQL);
  await seedDatabaseIfEmpty(db);
}

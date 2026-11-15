import * as SQLite from 'expo-sqlite';
import type {
    HealthRecord,
    NewHealthRecord,
} from '../models/HealthRecord';

const DATABASE_NAME = 'healthmate.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {

  if (database) {
    return database;
  }

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      water INTEGER NOT NULL
    );
  `);

  database = db;

  return db;
}

export async function addHealthRecord(
  record: NewHealthRecord
): Promise<number> {
  const db = await initDatabase();

  const result = await db.runAsync(
    `INSERT INTO health_records
    (date, steps, calories, water)
    VALUES (?, ?, ?, ?)`,
    record.date,
    record.steps,
    record.calories,
    record.water
  );

  return result.lastInsertRowId;
}



export async function getAllHealthRecords(): Promise<HealthRecord[]> {
  const db = await initDatabase();

  return await db.getAllAsync<HealthRecord>(
    `SELECT * FROM health_records
    ORDER BY date DESC, id DESC`
  );
}


export async function getHealthRecordById(
  id: number
): Promise<HealthRecord | null> {
  const db = await initDatabase();

  return await db.getFirstAsync<HealthRecord>(
    'SELECT * FROM health_records WHERE id = ?',
    id
  );
}


export async function updateHealthRecord(
  id: number,
  record: NewHealthRecord
): Promise<boolean> {
  const db = await initDatabase();

  const result = await db.runAsync(
    `UPDATE health_records
    SET date = ?, steps = ?, calories = ?, water = ?
    WHERE id = ?`,
    record.date,
    record.steps,
    record.calories,
    record.water,
    id
  );

  return result.changes > 0;
}


export async function deleteHealthRecord(
  id: number
): Promise<boolean> {
  const db = await initDatabase();

  const result = await db.runAsync(
    'DELETE FROM health_records WHERE id = ?',
    id
  );

  return result.changes > 0;
}

export async function searchHealthRecordsByDate(
  date: string
): Promise<HealthRecord[]> {
  const db = await initDatabase();

  return await db.getAllAsync<HealthRecord>(
    `SELECT * FROM health_records
    WHERE date = ?
    ORDER BY id DESC`,
    date
  );
}

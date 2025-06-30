import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';

sqlite3.verbose();

let db: Database;

export async function openDb() {
  if (!db) {
    const dbPath = path.join(__dirname, '../database/mydatabase.sqlite');
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function runMigrations() {
  const db = await openDb();

  // Create migrations tracking table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(__dirname, '../database/migrations');
  const files = await fs.readdir(migrationsDir);

  // Filter only .sql files and sort them
  const sqlFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of sqlFiles) {
    // Check if migration has already been applied
    const applied = await db.get('SELECT filename FROM migrations WHERE filename = ?', [file]);

    if (!applied) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      try {
        await db.exec(sql);
        await db.run('INSERT INTO migrations (filename) VALUES (?)', [file]);
        console.log(`Migration ${file} applied`);
      } catch (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
    } else {
      console.log(`Migration ${file} already applied, skipping`);
    }
  }
}

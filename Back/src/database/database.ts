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

  const migrationsDir = path.join(__dirname, '../database/migrations');
  // Lê todos os arquivos da pasta
  const files = await fs.readdir(migrationsDir);

  // Filtra só arquivos .sql e ordena (para garantir a ordem)
  const sqlFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = await fs.readFile(filePath, 'utf-8');
    await db.exec(sql);
    console.log(`Migration ${file} applied`);
  }
}

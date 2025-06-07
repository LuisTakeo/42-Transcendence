// src/users/users.repository.ts
import { openDb } from '../database/database';

export async function getUsersFromDb() {
	const db = await openDb();
	return db.all('SELECT * FROM users');
}

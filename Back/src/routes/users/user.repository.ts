// src/users/users.repository.ts
import { openDb } from '../../database/database';

export async function getUsersFromDb() {
	const db = await openDb();
	return db.all('SELECT * FROM users');
}

export async function findOrCreateUserDb(email: string, username?: string) {
	const db = await openDb();
	let user = await db.get('SELECT * FROM users WHERE email = ?', email);
	if (!user) {
	  const result = await db.run(
		`INSERT INTO users (email, username) VALUES (?, ?)`,
		email,
		username ?? ''
	  );
	  user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
	}
	return user;
  }

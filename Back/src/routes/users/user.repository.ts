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

  export async function saveSecret(email: string, secret: string) {
	const db = await openDb();
	await db.run(
	  `UPDATE users SET two_factor_secret = ? WHERE email = ?`,
	  secret,
	  email
	);
  }

  export async function getSecret(email: string): Promise<string | undefined> {
	const db = await openDb();
	const user = await db.get(`SELECT two_factor_secret FROM users WHERE email = ?`, email);
	return user?.two_factor_secret;
  }

  export async function enableTwoFactor(email: string) {
	const db = await openDb();
	await db.run(
	  `UPDATE users SET two_factor_enabled = 1 WHERE email = ?`,
	  email
	);
  }

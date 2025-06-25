// src/users/users.repository.ts
import { openDb } from '../../database/database';

export async function getUsersFromDb() {
	const db = await openDb();
	return db.all('SELECT * FROM users');
}

export async function findOrCreateUserDb(email: string, name: string, googleId: string) {
	const db = await openDb();
	let user = await db.get('SELECT * FROM users WHERE email = ?', email);
	if (!user) {

	  const username = email.split('@')[0];
	  const result = await db.run(
		`INSERT INTO users (email, username, name, google_id) VALUES (?, ?, ?, ?)`,
		email,
		username,
		name,
		googleId
	  );

	  user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
	} else if (!user.google_id || user.google_id !== googleId) {
		await db.run(
			`UPDATE users SET google_id = ? WHERE id = ?`,
			googleId,
			user.id
		  );

		  user = await db.get('SELECT * FROM users WHERE id = ?', user.id);
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

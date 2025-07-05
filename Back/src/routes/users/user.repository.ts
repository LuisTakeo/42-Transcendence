// src/routes/users/user.repository.ts
import { openDb } from '../../database/database';

// Helper function to construct full avatar URL from filename
function constructAvatarUrl(avatarFilename: string | null | undefined): string | null {
	if (!avatarFilename) return null;

	// If it's already a full URL, return as is
	if (avatarFilename.startsWith('http://') || avatarFilename.startsWith('https://')) {
		return avatarFilename;
	}

	// Construct the full URL using the backend port from environment or default
	const backendPort = process.env.BACK_PORT || '3142';
	const baseUrl = `http://localhost:${backendPort}`;

	return `${baseUrl}/public/avatars/${avatarFilename}`;
}

// Helper function to process user data and construct avatar URL
function processUserData(user: any): User | null {
	if (!user) return null;

	return {
		...user,
		avatar_url: constructAvatarUrl(user.avatar_url)
	};
}

// Interface for User data
export interface User {
	id?: number;
	name: string;
	username: string;
	email: string;
	password_hash: string;
	avatar_url?: string;
	is_online?: number;
	last_seen_at?: string;
	created_at?: string;
}

export interface CreateUserData {
	name: string;
	username: string;
	email: string;
	password_hash: string;
	avatar_url?: string;
}

export interface UpdateUserData {
	name?: string;
	username?: string;
	email?: string;
	password_hash?: string;
	avatar_url?: string;
	is_online?: number;
	last_seen_at?: string;
}

// Get all users with pagination and optional search
export async function getUsersFromDb(limit?: number, offset?: number, search?: string): Promise<User[]> {
	const db = await openDb();

	let query = 'SELECT * FROM users';
	const params: any[] = [];

	// Add search condition if provided
	if (search) {
		query += ' WHERE (name LIKE ? OR username LIKE ? OR email LIKE ?)';
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}

	query += ' ORDER BY created_at DESC';

	if (limit !== undefined) {
		query += ' LIMIT ?';
		params.push(limit);

		if (offset !== undefined) {
			query += ' OFFSET ?';
			params.push(offset);
		}
	}

	const users = await db.all(query, params);
	return users.map(user => processUserData(user)).filter((user): user is User => user !== null);
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

// Get all users without pagination (for simple lists, dropdowns, etc.)
export async function getAllUsersFromDb(): Promise<User[]> {
	const db = await openDb();
	const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');
	return users.map(user => processUserData(user)).filter((user): user is User => user !== null);
}

// Get total count of users with optional search
export async function getUsersCount(search?: string): Promise<number> {
	const db = await openDb();

	let query = 'SELECT COUNT(*) as count FROM users';
	const params: any[] = [];

	if (search) {
		query += ' WHERE (name LIKE ? OR username LIKE ? OR email LIKE ?)';
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}

	const result = await db.get(query, params);
	return result.count;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
	const db = await openDb();
	const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
	return processUserData(user);
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
	const db = await openDb();
	const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
	return processUserData(user);
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
	const db = await openDb();
	const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
	return processUserData(user);
}

// Create new user
export async function createUser(userData: CreateUserData): Promise<User> {
	const db = await openDb();
	const result = await db.run(
		`INSERT INTO users (name, username, email, password_hash, avatar_url, created_at)
		 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
		[userData.name, userData.username, userData.email, userData.password_hash, userData.avatar_url || null]
	);

	const newUser = await getUserById(result.lastID!);
	if (!newUser) {
		throw new Error('Failed to create user');
	}
	return newUser;
}

// Update user
export async function updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
	const db = await openDb();

	// Build dynamic update query
	const updateFields: string[] = [];
	const values: any[] = [];

	if (userData.name !== undefined) {
		updateFields.push('name = ?');
		values.push(userData.name);
	}
	if (userData.username !== undefined) {
		updateFields.push('username = ?');
		values.push(userData.username);
	}
	if (userData.email !== undefined) {
		updateFields.push('email = ?');
		values.push(userData.email);
	}
	if (userData.password_hash !== undefined) {
		updateFields.push('password_hash = ?');
		values.push(userData.password_hash);
	}
	if (userData.avatar_url !== undefined) {
		updateFields.push('avatar_url = ?');
		values.push(userData.avatar_url);
	}
	if (userData.is_online !== undefined) {
		updateFields.push('is_online = ?');
		values.push(userData.is_online);
	}
	if (userData.last_seen_at !== undefined) {
		updateFields.push('last_seen_at = ?');
		values.push(userData.last_seen_at);
	}

	if (updateFields.length === 0) {
		return getUserById(id); // No fields to update, return current user
	}

	values.push(id); // Add ID for WHERE clause

	const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
	const result = await db.run(query, values);

	if (result.changes === 0) {
		return null; // User not found
	}

	return getUserById(id);
}

// Delete user
export async function deleteUser(id: number): Promise<boolean> {
	const db = await openDb();
	const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
	return result.changes! > 0;
}

// Update user online status
export async function updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
	const db = await openDb();
	const lastSeenAt = isOnline ? null : "datetime('now')";
	await db.run(
		'UPDATE users SET is_online = ?, last_seen_at = COALESCE(?, last_seen_at) WHERE id = ?',
		[isOnline ? 1 : 0, lastSeenAt, id]
	);
}

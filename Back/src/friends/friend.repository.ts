// src/friends/friend.repository.ts
import { openDb } from '../database/database';

// Interface for Friend data
export interface Friend {
	user1_id: number;
	user2_id: number;
	user1_name?: string;
	user1_username?: string;
	user2_name?: string;
	user2_username?: string;
	created_at?: string;
}

export interface CreateFriendData {
	user1_id: number;
	user2_id: number;
}

// Helper function to ensure user1_id < user2_id (database constraint)
const normalizeFriendship = (userId1: number, userId2: number) => {
	return userId1 < userId2 
		? { user1_id: userId1, user2_id: userId2 }
		: { user1_id: userId2, user2_id: userId1 };
};

// Get all friendships with pagination and optional search
export async function getFriendsFromDb(limit?: number, offset?: number, search?: string): Promise<Friend[]> {
	const db = await openDb();
	
	let query = `
		SELECT 
			f.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u2.name as user2_name,
			u2.username as user2_username
		FROM friends f
		JOIN users u1 ON f.user1_id = u1.id
		JOIN users u2 ON f.user2_id = u2.id
	`;
	const params: any[] = [];
	
	// Add search condition if provided
	if (search) {
		query += ` WHERE (
			u1.name LIKE ? OR u1.username LIKE ? OR
			u2.name LIKE ? OR u2.username LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm, searchTerm);
	}
	
	query += ' ORDER BY f.user1_id, f.user2_id';
	
	if (limit !== undefined) {
		query += ' LIMIT ?';
		params.push(limit);
		
		if (offset !== undefined) {
			query += ' OFFSET ?';
			params.push(offset);
		}
	}
	
	return db.all(query, params);
}

// Get all friendships without pagination
export async function getAllFriendsFromDb(): Promise<Friend[]> {
	const db = await openDb();
	return db.all(`
		SELECT 
			f.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u2.name as user2_name,
			u2.username as user2_username
		FROM friends f
		JOIN users u1 ON f.user1_id = u1.id
		JOIN users u2 ON f.user2_id = u2.id
		ORDER BY f.user1_id, f.user2_id
	`);
}

// Get total count of friendships with optional search
export async function getFriendsCount(search?: string): Promise<number> {
	const db = await openDb();
	
	let query = `
		SELECT COUNT(*) as count 
		FROM friends f
		JOIN users u1 ON f.user1_id = u1.id
		JOIN users u2 ON f.user2_id = u2.id
	`;
	const params: any[] = [];
	
	if (search) {
		query += ` WHERE (
			u1.name LIKE ? OR u1.username LIKE ? OR
			u2.name LIKE ? OR u2.username LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm, searchTerm);
	}
	
	const result = await db.get(query, params);
	return result.count;
}

// Get friends by user ID (returns all friends of a specific user)
export async function getFriendsByUserId(userId: number): Promise<Friend[]> {
	const db = await openDb();
	return db.all(`
		SELECT 
			f.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u2.name as user2_name,
			u2.username as user2_username
		FROM friends f
		JOIN users u1 ON f.user1_id = u1.id
		JOIN users u2 ON f.user2_id = u2.id
		WHERE f.user1_id = ? OR f.user2_id = ?
		ORDER BY u1.name, u2.name
	`, [userId, userId]);
}

// Check if two users are friends
export async function areFriends(userId1: number, userId2: number): Promise<boolean> {
	const db = await openDb();
	const normalized = normalizeFriendship(userId1, userId2);
	
	const friendship = await db.get(
		'SELECT 1 FROM friends WHERE user1_id = ? AND user2_id = ?',
		[normalized.user1_id, normalized.user2_id]
	);
	
	return !!friendship;
}

// Create new friendship
export async function createFriendship(friendData: CreateFriendData): Promise<Friend> {
	const db = await openDb();
	const normalized = normalizeFriendship(friendData.user1_id, friendData.user2_id);
	
	await db.run(
		'INSERT INTO friends (user1_id, user2_id) VALUES (?, ?)',
		[normalized.user1_id, normalized.user2_id]
	);
	
	// Get the created friendship with user details
	const newFriendship = await db.get(`
		SELECT 
			f.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u2.name as user2_name,
			u2.username as user2_username
		FROM friends f
		JOIN users u1 ON f.user1_id = u1.id
		JOIN users u2 ON f.user2_id = u2.id
		WHERE f.user1_id = ? AND f.user2_id = ?
	`, [normalized.user1_id, normalized.user2_id]);
	
	if (!newFriendship) {
		throw new Error('Failed to create friendship');
	}
	return newFriendship;
}

// Delete friendship
export async function deleteFriendship(userId1: number, userId2: number): Promise<boolean> {
	const db = await openDb();
	const normalized = normalizeFriendship(userId1, userId2);
	
	const result = await db.run(
		'DELETE FROM friends WHERE user1_id = ? AND user2_id = ?',
		[normalized.user1_id, normalized.user2_id]
	);
	
	return result.changes! > 0;
}

// Get user's friend count
export async function getUserFriendCount(userId: number): Promise<number> {
	const db = await openDb();
	const result = await db.get(
		'SELECT COUNT(*) as count FROM friends WHERE user1_id = ? OR user2_id = ?',
		[userId, userId]
	);
	return result.count;
}

// Get mutual friends between two users
export async function getMutualFriends(userId1: number, userId2: number): Promise<Friend[]> {
	const db = await openDb();
	
	// Get friends of user1
	const user1Friends = await db.all(`
		SELECT CASE 
			WHEN user1_id = ? THEN user2_id 
			ELSE user1_id 
		END as friend_id
		FROM friends 
		WHERE user1_id = ? OR user2_id = ?
	`, [userId1, userId1, userId1]);
	
	// Get friends of user2
	const user2Friends = await db.all(`
		SELECT CASE 
			WHEN user1_id = ? THEN user2_id 
			ELSE user1_id 
		END as friend_id
		FROM friends 
		WHERE user1_id = ? OR user2_id = ?
	`, [userId2, userId2, userId2]);
	
	// Find mutual friends
	const mutualFriendIds = user1Friends
		.filter(f1 => user2Friends.some(f2 => f1.friend_id === f2.friend_id))
		.map(f => f.friend_id);
	
	if (mutualFriendIds.length === 0) {
		return [];
	}
	
	// Get user details for mutual friends
	const placeholders = mutualFriendIds.map(() => '?').join(',');
	return db.all(`
		SELECT 
			id as user_id,
			name,
			username,
			avatar_url,
			is_online
		FROM users 
		WHERE id IN (${placeholders})
		ORDER BY name
	`, mutualFriendIds);
}

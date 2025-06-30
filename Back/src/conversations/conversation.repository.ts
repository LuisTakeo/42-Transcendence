// src/conversations/conversation.repository.ts
import { openDb } from '../database/database';

// Interface for Conversation data
export interface Conversation {
	id: number;
	user1_id: number;
	user2_id: number;
	user1_name?: string;
	user1_username?: string;
	user1_avatar_url?: string;
	user2_name?: string;
	user2_username?: string;
	user2_avatar_url?: string;
	created_at: string;
	last_message?: string;
	last_message_at?: string;
	unread_count?: number;
}

export interface CreateConversationData {
	user1_id: number;
	user2_id: number;
}

// Helper function to ensure user1_id < user2_id (database constraint)
const normalizeConversation = (userId1: number, userId2: number) => {
	return userId1 < userId2
		? { user1_id: userId1, user2_id: userId2 }
		: { user1_id: userId2, user2_id: userId1 };
};

// Get all conversations with pagination and optional search
export async function getConversationsFromDb(limit?: number, offset?: number, search?: string): Promise<Conversation[]> {
	const db = await openDb();

	let query = `
		SELECT
			c.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u1.avatar_url as user1_avatar_url,
			u2.name as user2_name,
			u2.username as user2_username,
			u2.avatar_url as user2_avatar_url,
			(
				SELECT content
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message,
			(
				SELECT sent_at
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message_at
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
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

	query += ' ORDER BY COALESCE(last_message_at, c.created_at) DESC';

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

// Get all conversations without pagination
export async function getAllConversationsFromDb(): Promise<Conversation[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			c.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u1.avatar_url as user1_avatar_url,
			u2.name as user2_name,
			u2.username as user2_username,
			u2.avatar_url as user2_avatar_url,
			(
				SELECT content
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message,
			(
				SELECT sent_at
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message_at
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		ORDER BY COALESCE(last_message_at, c.created_at) DESC
	`);
}

// Get total count of conversations with optional search
export async function getConversationsCount(search?: string): Promise<number> {
	const db = await openDb();

	let query = `
		SELECT COUNT(*) as count
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
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

// Get conversation by ID
export async function getConversationById(id: number): Promise<Conversation | null> {
	const db = await openDb();
	const result = await db.get(`
		SELECT
			c.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u1.avatar_url as user1_avatar_url,
			u2.name as user2_name,
			u2.username as user2_username,
			u2.avatar_url as user2_avatar_url,
			(
				SELECT content
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message,
			(
				SELECT sent_at
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message_at
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		WHERE c.id = ?
	`, [id]);

	return result || null;
}

// Get conversations by user ID (returns all conversations for a specific user)
export async function getConversationsByUserId(userId: number): Promise<Conversation[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			c.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u1.avatar_url as user1_avatar_url,
			u2.name as user2_name,
			u2.username as user2_username,
			u2.avatar_url as user2_avatar_url,
			(
				SELECT content
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message,
			(
				SELECT sent_at
				FROM messages m
				WHERE m.conversation_id = c.id
				ORDER BY m.sent_at DESC
				LIMIT 1
			) as last_message_at
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = ? OR c.user2_id = ?
		ORDER BY COALESCE(last_message_at, c.created_at) DESC
	`, [userId, userId]);
}

// Check if conversation exists between two users
export async function conversationExists(userId1: number, userId2: number): Promise<Conversation | null> {
	const db = await openDb();
	const normalized = normalizeConversation(userId1, userId2);

	const result = await db.get(`
		SELECT
			c.*,
			u1.name as user1_name,
			u1.username as user1_username,
			u1.avatar_url as user1_avatar_url,
			u2.name as user2_name,
			u2.username as user2_username,
			u2.avatar_url as user2_avatar_url
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = ? AND c.user2_id = ?
	`, [normalized.user1_id, normalized.user2_id]);

	return result || null;
}

// Create new conversation
export async function createConversation(conversationData: CreateConversationData): Promise<Conversation> {
	const db = await openDb();
	const normalized = normalizeConversation(conversationData.user1_id, conversationData.user2_id);

	const result = await db.run(
		'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
		[normalized.user1_id, normalized.user2_id]
	);

	const conversationId = result.lastID;
	if (!conversationId) {
		throw new Error('Failed to create conversation');
	}

	// Get the created conversation with user details
	const newConversation = await getConversationById(conversationId);
	if (!newConversation) {
		throw new Error('Failed to retrieve created conversation');
	}

	return newConversation;
}

// Get or create conversation between two users
export async function getOrCreateConversation(userId1: number, userId2: number): Promise<Conversation> {
	// First, check if conversation already exists
	const existing = await conversationExists(userId1, userId2);
	if (existing) {
		return existing;
	}

	// If not, create new conversation
	return createConversation({ user1_id: userId1, user2_id: userId2 });
}

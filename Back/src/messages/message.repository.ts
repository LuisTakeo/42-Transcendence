// src/messages/message.repository.ts
import { openDb } from '../database/database';

// Interface for Message data
export interface Message {
	id: number;
	conversation_id: number;
	sender_id: number;
	content: string;
	sent_at: string;
	sender_name?: string;
	sender_username?: string;
	sender_avatar_url?: string;
}

export interface CreateMessageData {
	conversation_id: number;
	sender_id: number;
	content: string;
}

// Get all messages with pagination and optional search
export async function getMessagesFromDb(limit?: number, offset?: number, search?: string): Promise<Message[]> {
	const db = await openDb();

	let query = `
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
	`;
	const params: any[] = [];

	// Add search condition if provided
	if (search) {
		query += ` WHERE (
			m.content LIKE ? OR
			u.name LIKE ? OR u.username LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}

	query += ' ORDER BY m.sent_at DESC';

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

// Get all messages without pagination
export async function getAllMessagesFromDb(): Promise<Message[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		ORDER BY m.sent_at DESC
	`);
}

// Get total count of messages with optional search
export async function getMessagesCount(search?: string): Promise<number> {
	const db = await openDb();

	let query = `
		SELECT COUNT(*) as count
		FROM messages m
		JOIN users u ON m.sender_id = u.id
	`;
	const params: any[] = [];

	if (search) {
		query += ` WHERE (
			m.content LIKE ? OR
			u.name LIKE ? OR u.username LIKE ?
		)`;
		const searchTerm = `%${search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}

	const result = await db.get(query, params);
	return result.count;
}

// Get message by ID
export async function getMessageById(id: number): Promise<Message | null> {
	const db = await openDb();
	const result = await db.get(`
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.id = ?
	`, [id]);

	return result || null;
}

// Get messages by conversation ID with pagination
export async function getMessagesByConversationId(conversationId: number, limit?: number, offset?: number): Promise<Message[]> {
	const db = await openDb();

	let query = `
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = ?
		ORDER BY m.sent_at ASC
	`;
	const params: any[] = [conversationId];

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

// Get messages by user ID (sender)
export async function getMessagesByUserId(userId: number): Promise<Message[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.sender_id = ?
		ORDER BY m.sent_at DESC
	`, [userId]);
}

// Get conversation message count
export async function getConversationMessageCount(conversationId: number): Promise<number> {
	const db = await openDb();
	const result = await db.get(
		'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?',
		[conversationId]
	);
	return result.count;
}

// Create new message
export async function createMessage(messageData: CreateMessageData): Promise<Message> {
	const db = await openDb();

	const result = await db.run(
		'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
		[messageData.conversation_id, messageData.sender_id, messageData.content]
	);

	const messageId = result.lastID;
	if (!messageId) {
		throw new Error('Failed to create message');
	}

	// Get the created message with sender details
	const newMessage = await getMessageById(messageId);
	if (!newMessage) {
		throw new Error('Failed to retrieve created message');
	}

	return newMessage;
}

// Get recent messages across all conversations (for activity feed)
export async function getRecentMessages(limit: number = 50): Promise<Message[]> {
	const db = await openDb();
	return db.all(`
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		ORDER BY m.sent_at DESC
		LIMIT ?
	`, [limit]);
}

// Search messages by content
export async function searchMessages(searchTerm: string, limit?: number, offset?: number): Promise<Message[]> {
	const db = await openDb();

	let query = `
		SELECT
			m.*,
			u.name as sender_name,
			u.username as sender_username,
			u.avatar_url as sender_avatar_url
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.content LIKE ?
		ORDER BY m.sent_at DESC
	`;
	const params: any[] = [`%${searchTerm}%`];

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

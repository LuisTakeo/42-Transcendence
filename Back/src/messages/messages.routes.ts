// src/messages/messages.routes.ts
import { FastifyInstance } from 'fastify';
import {
	getAllMessages,
	getAllMessagesSimple,
	getMessageById,
	getMessagesByConversation,
	getMessagesByUser,
	getRecentMessages,
	searchMessages,
	createMessage
} from './messages.controller';

export default async function messagesRoutes(server: FastifyInstance) {
	// GET /messages - Get all messages with pagination
	server.get('/', getAllMessages);

	// GET /messages/all - Get all messages without pagination
	server.get('/all', getAllMessagesSimple);

	// GET /messages/recent - Get recent messages across all conversations
	server.get('/recent', getRecentMessages);

	// GET /messages/search - Search messages by content
	server.get('/search', searchMessages);

	// GET /messages/:id - Get message by ID
	server.get('/:id', getMessageById);

	// GET /messages/conversation/:conversationId - Get messages by conversation ID
	server.get('/conversation/:conversationId', getMessagesByConversation);

	// GET /messages/user/:userId - Get messages by user ID (sender)
	server.get('/user/:userId', getMessagesByUser);

	// POST /messages - Create new message
	server.post('/', createMessage);
}

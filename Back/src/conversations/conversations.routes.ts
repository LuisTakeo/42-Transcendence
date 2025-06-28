// src/conversations/conversations.routes.ts
import { FastifyInstance } from 'fastify';
import {
	getAllConversations,
	getAllConversationsSimple,
	getConversationById,
	getConversationsByUser,
	checkConversation,
	createConversation,
	getOrCreateConversation
} from './conversations.controller';

export default async function conversationsRoutes(server: FastifyInstance) {
	// GET /conversations - Get all conversations with pagination
	server.get('/', getAllConversations);

	// GET /conversations/all - Get all conversations without pagination
	server.get('/all', getAllConversationsSimple);

	// GET /conversations/:id - Get conversation by ID
	server.get('/:id', getConversationById);

	// GET /conversations/user/:userId - Get conversations by user ID
	server.get('/user/:userId', getConversationsByUser);

	// GET /conversations/check/:userId1/:userId2 - Check if conversation exists between two users
	server.get('/check/:userId1/:userId2', checkConversation);

	// GET /conversations/between/:userId1/:userId2 - Get or create conversation between two users
	server.get('/between/:userId1/:userId2', getOrCreateConversation);

	// POST /conversations - Create new conversation
	server.post('/', createConversation);
}

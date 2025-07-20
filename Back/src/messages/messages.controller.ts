// src/messages/messages.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as repository from './message.repository';
import { CreateMessageData } from './message.repository';

// Validation helper functions
const isValidId = (id: number): boolean => {
	return Number.isInteger(id) && id > 0;
};

const isValidContent = (content: string): boolean => {
	return typeof content === 'string' && content.trim().length > 0 && content.length <= 1000;
};

// Get all messages with pagination
export async function getAllMessages(request: FastifyRequest, reply: FastifyReply) {
	try {
		// Extract pagination parameters from query string
		const { page = '1', limit = '10', search } = request.query as {
			page?: string;
			limit?: string;
			search?: string;
		};

		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);

		// Validation
		if (isNaN(pageNum) || pageNum < 1) {
			return reply.status(400).send({
				success: false,
				error: 'Page must be a positive integer'
			});
		}

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Limit must be between 1 and 100'
			});
		}

		const offset = (pageNum - 1) * limitNum;

		// Get messages and total count
		const [messages, totalCount] = await Promise.all([
			repository.getMessagesFromDb(limitNum, offset, search),
			repository.getMessagesCount(search)
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: messages,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				limit: limitNum,
				hasNextPage,
				hasPrevPage,
				nextPage: hasNextPage ? pageNum + 1 : null,
				prevPage: hasPrevPage ? pageNum - 1 : null
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get all messages without pagination
export async function getAllMessagesSimple(request: FastifyRequest, reply: FastifyReply) {
	try {
		const messages = await repository.getAllMessagesFromDb();

		reply.send({
			success: true,
			data: messages,
			count: messages.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get message by ID
export async function getMessageById(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { id } = request.params as { id: string };
		const messageId = parseInt(id, 10);

		if (isNaN(messageId) || !isValidId(messageId)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid message ID'
			});
		}

		const message = await repository.getMessageById(messageId);

		if (!message) {
			return reply.status(404).send({
				success: false,
				error: 'Message not found'
			});
		}

		reply.send({
			success: true,
			data: message
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve message',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get messages by conversation ID
export async function getMessagesByConversation(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { conversationId } = request.params as { conversationId: string };
		const { page = '1', limit = '50' } = request.query as {
			page?: string;
			limit?: string;
		};

		const conversationIdNum = parseInt(conversationId, 10);
		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);

		if (isNaN(conversationIdNum) || !isValidId(conversationIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid conversation ID'
			});
		}

		if (isNaN(pageNum) || pageNum < 1) {
			return reply.status(400).send({
				success: false,
				error: 'Page must be a positive integer'
			});
		}

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Limit must be between 1 and 100'
			});
		}

		const offset = (pageNum - 1) * limitNum;

		// Get messages and total count for this conversation
		const [messages, totalCount] = await Promise.all([
			repository.getMessagesByConversationId(conversationIdNum, limitNum, offset),
			repository.getConversationMessageCount(conversationIdNum)
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		reply.send({
			success: true,
			data: messages,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				limit: limitNum,
				hasNextPage,
				hasPrevPage,
				nextPage: hasNextPage ? pageNum + 1 : null,
				prevPage: hasPrevPage ? pageNum - 1 : null
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve conversation messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get messages by user ID (sender)
export async function getMessagesByUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { userId } = request.params as { userId: string };
		const userIdNum = parseInt(userId, 10);

		if (isNaN(userIdNum) || !isValidId(userIdNum)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid user ID'
			});
		}

		const messages = await repository.getMessagesByUserId(userIdNum);

		reply.send({
			success: true,
			data: messages,
			count: messages.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve user messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Get recent messages
export async function getRecentMessages(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { limit = '50' } = request.query as { limit?: string };
		const limitNum = parseInt(limit, 10);

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Limit must be between 1 and 100'
			});
		}

		const messages = await repository.getRecentMessages(limitNum);

		reply.send({
			success: true,
			data: messages,
			count: messages.length
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to retrieve recent messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Search messages
export async function searchMessages(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { q, page = '1', limit = '10' } = request.query as {
			q?: string;
			page?: string;
			limit?: string;
		};

		if (!q || typeof q !== 'string' || q.trim().length === 0) {
			return reply.status(400).send({
				success: false,
				error: 'Search query (q) is required'
			});
		}

		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);

		if (isNaN(pageNum) || pageNum < 1) {
			return reply.status(400).send({
				success: false,
				error: 'Page must be a positive integer'
			});
		}

		if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
			return reply.status(400).send({
				success: false,
				error: 'Limit must be between 1 and 100'
			});
		}

		const offset = (pageNum - 1) * limitNum;
		const messages = await repository.searchMessages(q.trim(), limitNum, offset);

		reply.send({
			success: true,
			data: messages,
			count: messages.length,
			query: q.trim()
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: 'Failed to search messages',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Create new message
export async function createMessage(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { conversation_id, sender_id, content } = request.body as CreateMessageData;

		// Validation
		if (!conversation_id || !sender_id || !content) {
			return reply.status(400).send({
				success: false,
				error: 'conversation_id, sender_id, and content are required'
			});
		}

		if (!isValidId(conversation_id) || !isValidId(sender_id)) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid conversation_id or sender_id'
			});
		}

		if (!isValidContent(content)) {
			return reply.status(400).send({
				success: false,
				error: 'Content must be a non-empty string with maximum 1000 characters'
			});
		}

		// Create new message
		const newMessage = await repository.createMessage({
			conversation_id,
			sender_id,
			content: content.trim()
		});

		reply.status(201).send({
			success: true,
			data: newMessage,
			message: 'Message created successfully'
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
			return reply.status(400).send({
				success: false,
				error: 'Invalid conversation_id or sender_id - referenced records do not exist'
			});
		}

		reply.status(500).send({
			success: false,
			error: 'Failed to create message',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

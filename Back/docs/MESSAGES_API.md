# Messages API Documentation

This document describes the CRUD operations for the Messages resource.

## Base URL
```
http://localhost:3142/messages
```

## Endpoints

### 1. Get All Messages (with Pagination)
**GET** `/messages`

Returns a paginated list of all messages with sender information, ordered by newest first.

**Query Parameters:**
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of messages per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional): Search term to filter messages by content or sender name/username

**Examples:**
- `GET /messages` - Get first 10 messages
- `GET /messages?page=2&limit=20` - Get 20 messages from page 2
- `GET /messages?search=hello` - Search for messages containing "hello"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "content": "Hey, how are you?",
      "sent_at": "2024-01-15 14:25:00",
      "sender_name": "Alice Silva",
      "sender_username": "alice",
      "sender_avatar_url": "https://example.com/alice.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 2. Get All Messages (Simple List)
**GET** `/messages/all`

Returns all messages without pagination.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "content": "Hey, how are you?",
      "sent_at": "2024-01-15 14:25:00",
      "sender_name": "Alice Silva",
      "sender_username": "alice",
      "sender_avatar_url": "https://example.com/alice.jpg"
    }
  ],
  "count": 47
}
```

### 3. Get Message by ID
**GET** `/messages/:id`

Returns a specific message by its ID.

**Parameters:**
- `id`: Message ID (integer)

**Example:**
- `GET /messages/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 1,
    "content": "Hey, how are you?",
    "sent_at": "2024-01-15 14:25:00",
    "sender_name": "Alice Silva",
    "sender_username": "alice",
    "sender_avatar_url": "https://example.com/alice.jpg"
  }
}
```

### 4. Get Messages by Conversation ID
**GET** `/messages/conversation/:conversationId`

Returns all messages for a specific conversation, ordered chronologically (oldest first for chat display).

**Parameters:**
- `conversationId`: Conversation ID (integer)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of messages per page (default: 50, maximum: 100)

**Example:**
- `GET /messages/conversation/1?page=1&limit=30`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "content": "Hey, how are you?",
      "sent_at": "2024-01-15 14:25:00",
      "sender_name": "Alice Silva",
      "sender_username": "alice",
      "sender_avatar_url": "https://example.com/alice.jpg"
    },
    {
      "id": 2,
      "conversation_id": 1,
      "sender_id": 2,
      "content": "I'm good, thanks! How about you?",
      "sent_at": "2024-01-15 14:26:00",
      "sender_name": "Bob Santos",
      "sender_username": "bob",
      "sender_avatar_url": "https://example.com/bob.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 15,
    "limit": 30,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 5. Get Messages by User ID
**GET** `/messages/user/:userId`

Returns all messages sent by a specific user.

**Parameters:**
- `userId`: User ID (integer)

**Example:**
- `GET /messages/user/1` - Get all messages sent by user 1

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "content": "Hey, how are you?",
      "sent_at": "2024-01-15 14:25:00",
      "sender_name": "Alice Silva",
      "sender_username": "alice",
      "sender_avatar_url": "https://example.com/alice.jpg"
    }
  ],
  "count": 23
}
```

### 6. Get Recent Messages
**GET** `/messages/recent`

Returns recent messages across all conversations for activity feeds.

**Query Parameters:**
- `limit` (optional): Number of recent messages (default: 50, maximum: 100)

**Example:**
- `GET /messages/recent?limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "conversation_id": 2,
      "sender_id": 3,
      "content": "See you tomorrow!",
      "sent_at": "2024-01-15 16:45:00",
      "sender_name": "Carol Ferreira",
      "sender_username": "carol",
      "sender_avatar_url": "https://example.com/carol.jpg"
    }
  ],
  "count": 20
}
```

### 7. Search Messages
**GET** `/messages/search`

Search messages by content.

**Query Parameters:**
- `q`: Search query (required)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10, maximum: 100)

**Example:**
- `GET /messages/search?q=hello&page=1&limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "content": "Hello there!",
      "sent_at": "2024-01-15 14:25:00",
      "sender_name": "Alice Silva",
      "sender_username": "alice",
      "sender_avatar_url": "https://example.com/alice.jpg"
    }
  ],
  "count": 3,
  "query": "hello"
}
```

### 8. Create New Message
**POST** `/messages`

Creates a new message in a conversation.

**Request Body:**
```json
{
  "conversation_id": 1,
  "sender_id": 1,
  "content": "Hello, how are you doing today?"
}
```

**Validation Rules:**
- `conversation_id`: Required, positive integer, must exist in conversations table
- `sender_id`: Required, positive integer, must exist in users table
- `content`: Required, non-empty string, maximum 1000 characters

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "conversation_id": 1,
    "sender_id": 1,
    "content": "Hello, how are you doing today?",
    "sent_at": "2024-01-15 15:30:00",
    "sender_name": "Alice Silva",
    "sender_username": "alice",
    "sender_avatar_url": "https://example.com/alice.jpg"
  },
  "message": "Message created successfully"
}
```

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "error": "Content must be a non-empty string with maximum 1000 characters"
}
```

### Not Found
```json
{
  "success": false,
  "error": "Message not found"
}
```

### Foreign Key Constraint
```json
{
  "success": false,
  "error": "Invalid conversation_id or sender_id - referenced records do not exist"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to create message",
  "message": "Detailed error message"
}
```

## Features

- **Pagination**: All list endpoints support pagination with configurable limits
- **Search**: Full-text search across message content and sender information
- **Chronological Ordering**: Messages in conversations ordered chronologically for chat display
- **Activity Feed**: Recent messages endpoint for activity feeds and dashboards
- **Rich Sender Data**: Includes sender name, username, and avatar in all responses
- **Content Validation**: Message content length validation (max 1000 characters)
- **Comprehensive Validation**: Input validation and error handling
- **Foreign Key Integrity**: Ensures messages reference valid conversations and users

## Database Schema

```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Notes

- **No Update Operations**: Messages are immutable once sent (preserves chat integrity)
- **No Delete Operations**: Messages are preserved for chat history and audit purposes
- **Automatic Timestamps**: Messages automatically get `sent_at` timestamp on creation
- **Cascade Delete**: Messages are automatically deleted when conversation or sender is deleted
- **Optimized Queries**: Efficient queries with proper JOINs for sender information
- **Content Length Limit**: 1000 character limit prevents abuse and ensures good UX

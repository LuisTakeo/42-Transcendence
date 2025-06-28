# Conversations API Documentation

This document describes the CRUD operations for the Conversations resource.

## Base URL
```
http://localhost:3143/conversations
```

## Endpoints

### 1. Get All Conversations (with Pagination)
**GET** `/conversations`

Returns a paginated list of all conversations with user information and last message.

**Query Parameters:**
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of conversations per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional): Search term to filter conversations by user names or usernames

**Examples:**
- `GET /conversations` - Get first 10 conversations
- `GET /conversations?page=2&limit=5` - Get 5 conversations from page 2
- `GET /conversations?search=alice` - Search for conversations containing "alice"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user1_avatar_url": "https://example.com/alice.jpg",
      "user2_name": "Bob Santos",
      "user2_username": "bob",
      "user2_avatar_url": "https://example.com/bob.jpg",
      "created_at": "2024-01-15 10:30:00",
      "last_message": "Hey, how are you?",
      "last_message_at": "2024-01-15 14:25:00"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 15,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 2. Get All Conversations (Simple List)
**GET** `/conversations/all`

Returns all conversations without pagination.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob",
      "created_at": "2024-01-15 10:30:00",
      "last_message": "Hey, how are you?",
      "last_message_at": "2024-01-15 14:25:00"
    }
  ],
  "count": 15
}
```

### 3. Get Conversation by ID
**GET** `/conversations/:id`

Returns a specific conversation by its ID.

**Parameters:**
- `id`: Conversation ID (integer)

**Example:**
- `GET /conversations/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "user1_name": "Alice Silva",
    "user1_username": "alice",
    "user1_avatar_url": "https://example.com/alice.jpg",
    "user2_name": "Bob Santos",
    "user2_username": "bob",
    "user2_avatar_url": "https://example.com/bob.jpg",
    "created_at": "2024-01-15 10:30:00",
    "last_message": "Hey, how are you?",
    "last_message_at": "2024-01-15 14:25:00"
  }
}
```

### 4. Get Conversations by User ID
**GET** `/conversations/user/:userId`

Returns all conversations for a specific user, sorted by last message time.

**Parameters:**
- `userId`: User ID (integer)

**Example:**
- `GET /conversations/user/1` - Get all conversations for user 1

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob",
      "created_at": "2024-01-15 10:30:00",
      "last_message": "Hey, how are you?",
      "last_message_at": "2024-01-15 14:25:00"
    }
  ],
  "count": 3
}
```

### 5. Check if Conversation Exists
**GET** `/conversations/check/:userId1/:userId2`

Check if a conversation exists between two users.

**Parameters:**
- `userId1`: First user ID (integer)
- `userId2`: Second user ID (integer)

**Example:**
- `GET /conversations/check/1/2`

**Response:**
```json
{
  "success": true,
  "data": {
    "user1_id": 1,
    "user2_id": 2,
    "conversation_exists": true,
    "conversation": {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob",
      "created_at": "2024-01-15 10:30:00"
    }
  }
}
```

### 6. Get or Create Conversation
**GET** `/conversations/between/:userId1/:userId2`

Get existing conversation between two users, or create it if it doesn't exist.

**Parameters:**
- `userId1`: First user ID (integer)
- `userId2`: Second user ID (integer)

**Example:**
- `GET /conversations/between/1/3`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user1_id": 1,
    "user2_id": 3,
    "user1_name": "Alice Silva",
    "user1_username": "alice",
    "user2_name": "Carol Ferreira",
    "user2_username": "carol",
    "created_at": "2024-01-15 15:45:00"
  }
}
```

### 7. Create New Conversation
**POST** `/conversations`

Creates a new conversation between two users.

**Request Body:**
```json
{
  "user1_id": 1,
  "user2_id": 3
}
```

**Validation Rules:**
- `user1_id`: Required, positive integer, must exist in users table
- `user2_id`: Required, positive integer, must exist in users table
- `user1_id` cannot equal `user2_id` (no self-conversations)
- Conversation must not already exist

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user1_id": 1,
    "user2_id": 3,
    "user1_name": "Alice Silva",
    "user1_username": "alice",
    "user2_name": "Carol Ferreira",
    "user2_username": "carol",
    "created_at": "2024-01-15 15:45:00"
  },
  "message": "Conversation created successfully"
}
```

**Response (Conflict - Conversation Already Exists):**
```json
{
  "success": false,
  "error": "Conversation already exists",
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "user1_name": "Alice Silva",
    "user1_username": "alice",
    "user2_name": "Bob Santos",
    "user2_username": "bob",
    "created_at": "2024-01-15 10:30:00"
  }
}
```

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "error": "Invalid user IDs"
}
```

### Not Found
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to create conversation",
  "message": "Detailed error message"
}
```

## Features

- **Pagination**: All list endpoints support pagination with configurable limits
- **Search**: Search conversations by user names or usernames
- **Last Message**: Automatically includes the last message in conversation lists
- **User Information**: Rich data with user names, usernames, and avatars
- **Normalized Storage**: Conversations stored with `user1_id < user2_id` constraint
- **Validation**: Comprehensive input validation and error handling
- **Self-Conversation Protection**: Prevents creating conversations with same user
- **Duplicate Prevention**: Ensures unique conversations between user pairs

## Database Schema

```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Notes

- **No Update Operations**: Conversations themselves are immutable (you add messages, not edit conversations)
- **No Delete Operations**: Conversations are preserved for chat history
- **Automatic Ordering**: Conversations ordered by last message time for better UX
- **Efficient Queries**: Optimized queries with proper JOINs and indexes

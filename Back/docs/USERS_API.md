# Users API Documentation

This document describes the complete CRUD operations for the Users resource.

## Base URL
```
http://localhost:3143/users
```

## Endpoints

### 1. Get All Users (with Pagination)
**GET** `/users`

Returns a paginated list of all users (passwords excluded for security).

**Query Parameters:**
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of users per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional): Search term to filter users by name, username, or email

**Examples:**
- `GET /users` - Get first 10 users
- `GET /users?page=2&limit=5` - Get 5 users from page 2
- `GET /users?search=john` - Search for users containing "john"
- `GET /users?search=john&page=1&limit=3` - Search with pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_online": 0,
      "last_seen_at": "2025-06-28T10:00:00Z",
      "created_at": "2025-06-28T09:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 42,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 1.2. Get All Users (without Pagination)
**GET** `/users/all`

Returns all users without pagination (useful for dropdowns, user selection lists, etc.).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_online": 0,
      "last_seen_at": "2025-06-28T10:00:00Z",
      "created_at": "2025-06-28T09:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane.smith@example.com",
      "avatar_url": null,
      "is_online": 1,
      "last_seen_at": null,
      "created_at": "2025-06-28T11:00:00Z"
    }
  ],
  "count": 2
}
```

### 2. Get User by ID
**GET** `/users/:id`

Returns a specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_online": 0,
    "last_seen_at": "2025-06-28T10:00:00Z",
    "created_at": "2025-06-28T09:00:00Z"
  }
}
```

### 3. Create User
**POST** `/users`

Creates a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password_hash": "hashed_password_here",
  "avatar_url": "https://example.com/avatar.jpg" // optional
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `username`: Required, 3-20 characters, alphanumeric and underscores only, must be unique
- `email`: Required, valid email format, must be unique
- `password_hash`: Required
- `avatar_url`: Optional

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_online": 0,
    "last_seen_at": null,
    "created_at": "2025-06-28T09:00:00Z"
  },
  "message": "User created successfully"
}
```

### 4. Update User
**PUT** `/users/:id`

Updates an existing user. All fields are optional.

**Request Body:**
```json
{
  "name": "John Updated",
  "username": "johnupdated",
  "email": "john.updated@example.com",
  "password_hash": "new_hashed_password",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "is_online": 1,
  "last_seen_at": "2025-06-28T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Updated",
    "username": "johnupdated",
    "email": "john.updated@example.com",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "is_online": 1,
    "last_seen_at": "2025-06-28T10:00:00Z",
    "created_at": "2025-06-28T09:00:00Z"
  },
  "message": "User updated successfully"
}
```

### 5. Delete User
**DELETE** `/users/:id`

Deletes a user by ID.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. Update User Online Status
**PATCH** `/users/:id/status`

Updates only the online status of a user.

**Request Body:**
```json
{
  "is_online": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User online status updated successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

```json
{
  "success": false,
  "error": "Page must be a positive integer"
}
```

```json
{
  "success": false,
  "error": "Limit must be between 1 and 100"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create user",
  "message": "Database connection failed"
}
```

## Database Schema

The users table has the following structure:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    is_online INTEGER DEFAULT 0,
    last_seen_at DATETIME,
    created_at DATETIME DEFAULT (datetime('now'))
);
```

## Security Notes

- Passwords are never returned in API responses
- All input is validated and sanitized
- SQL injection protection through parameterized queries
- Username and email uniqueness is enforced
- Proper HTTP status codes are used throughout

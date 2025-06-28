# Friends API Documentation

This document describes the complete CRUD operations for the Friends resource.

## Base URL
```
http://localhost:3143/friends
```

## Endpoints

### 1. Get All Friendships (with Pagination)
**GET** `/friends`

Returns a paginated list of all friendships with user information.

**Query Parameters:**
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of friendships per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional): Search term to filter friendships by user names or usernames

**Examples:**
- `GET /friends` - Get first 10 friendships
- `GET /friends?page=2&limit=5` - Get 5 friendships from page 2
- `GET /friends?search=alice` - Search for friendships containing "alice"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob"
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

### 1.2. Get All Friendships (without Pagination)
**GET** `/friends/all`

Returns all friendships without pagination.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob"
    }
  ],
  "count": 15
}
```

### 2. Get Friends by User ID
**GET** `/friends/user/:userId`

Returns all friends for a specific user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user1_id": 1,
      "user2_id": 2,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "Bob Santos",
      "user2_username": "bob"
    },
    {
      "user1_id": 1,
      "user2_id": 4,
      "user1_name": "Alice Silva",
      "user1_username": "alice",
      "user2_name": "John Doe",
      "user2_username": "johndoe"
    }
  ],
  "count": 2
}
```

### 3. Get User's Friend Count
**GET** `/friends/user/:userId/count`

Returns the total number of friends for a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "friend_count": 5
  }
}
```

### 4. Check Friendship Status
**GET** `/friends/check/:userId1/:userId2`

Checks if two users are friends.

**Response:**
```json
{
  "success": true,
  "data": {
    "user1_id": 1,
    "user2_id": 2,
    "are_friends": true
  }
}
```

### 5. Get Mutual Friends
**GET** `/friends/mutual/:userId1/:userId2`

Returns mutual friends between two users.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 4,
      "name": "John Doe",
      "username": "johndoe",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_online": 1
    }
  ],
  "count": 1
}
```

### 6. Create Friendship
**POST** `/friends`

Creates a new friendship between two users.

**Request Body:**
```json
{
  "user1_id": 1,
  "user2_id": 2
}
```

**Validation Rules:**
- `user1_id`: Required, must be a valid user ID
- `user2_id`: Required, must be a valid user ID, cannot be same as user1_id
- Both users must exist in the database
- Friendship must not already exist

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user1_id": 1,
    "user2_id": 2,
    "user1_name": "Alice Silva",
    "user1_username": "alice",
    "user2_name": "Bob Santos",
    "user2_username": "bob"
  },
  "message": "Friendship created successfully"
}
```

### 7. Delete Friendship
**DELETE** `/friends/:userId1/:userId2`

Deletes a friendship between two users.

**Response:**
```json
{
  "success": true,
  "message": "Friendship deleted successfully"
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
  "error": "Users cannot be friends with themselves"
}
```

```json
{
  "success": false,
  "error": "One or both users do not exist"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Friendship not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Friendship already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create friendship",
  "message": "Database connection failed"
}
```

## Database Schema

The friends table has the following structure:

```sql
CREATE TABLE friends (
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    PRIMARY KEY (user1_id, user2_id),
    CHECK (user1_id < user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Key Features

### **Normalization**
- Friendships are automatically normalized (user1_id < user2_id)
- Prevents duplicate friendships in different orders
- Consistent data storage regardless of input order

### **Rich Queries**
- Get all friends for a user
- Check friendship status between any two users
- Find mutual friends between users
- Get friend counts and statistics

### **Search & Pagination**
- Search friendships by user names or usernames
- Paginated results for large friend lists
- Simple endpoint for quick friend lookups

### **Validation**
- Users cannot be friends with themselves
- Duplicate friendships prevented
- User existence validation
- Proper error handling for all edge cases

## Security Notes

- All input is validated and sanitized
- SQL injection protection through parameterized queries
- User IDs are validated against existing users
- Proper HTTP status codes are used throughout
- Database constraints enforce data integrity
- Cascading deletes when users are removed

## Use Cases

- **Friend Lists**: Use `GET /friends/user/:userId` for user profiles
- **Friend Suggestions**: Use mutual friends and friend counts
- **Social Features**: Check friendship status before allowing interactions
- **Admin Panel**: Use paginated endpoint to manage all friendships
- **Statistics**: Get friend counts for user analytics

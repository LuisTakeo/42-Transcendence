# Matches API Documentation

This document describes the complete CRUD operations for the Matches resource.

## Base URL
```
http://localhost:3142/matches
```

## Endpoints

### 1. Get All Matches (with Pagination)
**GET** `/matches`

Returns a paginated list of all matches with player information.

**Query Parameters:**
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of matches per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional): Search term to filter matches by player names or aliases

**Examples:**
- `GET /matches` - Get first 10 matches
- `GET /matches?page=2&limit=5` - Get 5 matches from page 2
- `GET /matches?search=alice` - Search for matches containing "alice"
- `GET /matches?search=alice&page=1&limit=3` - Search with pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "player1_id": 1,
      "player2_id": 2,
      "player1_alias": "Alice",
      "player2_alias": "Bob",
      "winner_id": 1,
      "player1_score": 5,
      "player2_score": 3,
      "played_at": "2025-06-28T14:30:00Z",
      "player1_name": "Alice Silva",
      "player1_username": "alice",
      "player2_name": "Bob Santos",
      "player2_username": "bob",
      "winner_name": "Alice Silva",
      "winner_username": "alice"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 1.2. Get All Matches (without Pagination)
**GET** `/matches/all`

Returns all matches without pagination (useful for statistics, charts, etc.).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "player1_id": 1,
      "player2_id": 2,
      "player1_alias": "Alice",
      "player2_alias": "Bob",
      "winner_id": 1,
      "player1_score": 5,
      "player2_score": 3,
      "played_at": "2025-06-28T14:30:00Z",
      "player1_name": "Alice Silva",
      "player1_username": "alice",
      "player2_name": "Bob Santos",
      "player2_username": "bob",
      "winner_name": "Alice Silva",
      "winner_username": "alice"
    }
  ],
  "count": 25
}
```

### 2. Get Match by ID
**GET** `/matches/:id`

Returns a specific match by ID with full player information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "player1_id": 1,
    "player2_id": 2,
    "player1_alias": "Alice",
    "player2_alias": "Bob",
    "winner_id": 1,
    "player1_score": 5,
    "player2_score": 3,
    "played_at": "2025-06-28T14:30:00Z",
    "player1_name": "Alice Silva",
    "player1_username": "alice",
    "player2_name": "Bob Santos",
    "player2_username": "bob",
    "winner_name": "Alice Silva",
    "winner_username": "alice"
  }
}
```

### 3. Get Matches by Player
**GET** `/matches/player/:playerId`

Returns all matches for a specific player.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "player1_id": 1,
      "player2_id": 2,
      "player1_alias": "Alice",
      "player2_alias": "Bob",
      "winner_id": 1,
      "player1_score": 5,
      "player2_score": 3,
      "played_at": "2025-06-28T14:30:00Z",
      "player1_name": "Alice Silva",
      "player1_username": "alice",
      "player2_name": "Bob Santos",
      "player2_username": "bob",
      "winner_name": "Alice Silva",
      "winner_username": "alice"
    }
  ],
  "count": 10
}
```

### 4. Get Player Statistics
**GET** `/matches/player/:playerId/stats`

Returns statistics for a specific player.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMatches": 15,
    "wins": 10,
    "losses": 5,
    "winRate": 66.67
  }
}
```

### 5. Create Match
**POST** `/matches`

Creates a new match.

**Request Body:**
```json
{
  "player1_id": 1,
  "player2_id": 2,
  "player1_alias": "Alice",
  "player2_alias": "Bob",
  "winner_id": 1,
  "player1_score": 5,
  "player2_score": 3
}
```

**Validation Rules:**
- `player1_id`: Required, must be a valid user ID
- `player2_id`: Required, must be a valid user ID, cannot be same as player1_id
- `player1_alias`: Required, 1-50 characters
- `player2_alias`: Required, 1-50 characters
- `player1_score`: Required, non-negative integer
- `player2_score`: Required, non-negative integer
- `winner_id`: Optional, must be either player1_id or player2_id if provided

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "player1_id": 1,
    "player2_id": 2,
    "player1_alias": "Alice",
    "player2_alias": "Bob",
    "winner_id": 1,
    "player1_score": 5,
    "player2_score": 3,
    "played_at": "2025-06-28T14:30:00Z",
    "player1_name": "Alice Silva",
    "player1_username": "alice",
    "player2_name": "Bob Santos",
    "player2_username": "bob",
    "winner_name": "Alice Silva",
    "winner_username": "alice"
  },
  "message": "Match created successfully"
}
```

### 6. Update Match
**PUT** `/matches/:id`

Updates an existing match. All fields are optional.

**Request Body:**
```json
{
  "player1_alias": "Alice Updated",
  "player2_alias": "Bob Updated",
  "winner_id": 2,
  "player1_score": 4,
  "player2_score": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "player1_id": 1,
    "player2_id": 2,
    "player1_alias": "Alice Updated",
    "player2_alias": "Bob Updated",
    "winner_id": 2,
    "player1_score": 4,
    "player2_score": 6,
    "played_at": "2025-06-28T14:30:00Z",
    "player1_name": "Alice Silva",
    "player1_username": "alice",
    "player2_name": "Bob Santos",
    "player2_username": "bob",
    "winner_name": "Bob Santos",
    "winner_username": "bob"
  },
  "message": "Match updated successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid match ID"
}
```

```json
{
  "success": false,
  "error": "Player cannot play against themselves"
}
```

```json
{
  "success": false,
  "error": "Winner must be one of the players"
}
```

```json
{
  "success": false,
  "error": "Player1 score must be a non-negative integer"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Match not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create match",
  "message": "Database connection failed"
}
```

## Database Schema

The matches table has the following structure:

```sql
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_alias TEXT NOT NULL,
    player2_alias TEXT NOT NULL,
    winner_id INTEGER,
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    played_at DATETIME DEFAULT (datetime('now')),
    CHECK (player1_id <> player2_id),
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id)
);
```

## Features

- **Player Information**: All match responses include player names and usernames
- **Search Functionality**: Search matches by player names or aliases
- **Statistics**: Get comprehensive player statistics (wins, losses, win rate)
- **Player History**: Get all matches for a specific player
- **Validation**: Comprehensive validation for all fields
- **No Deletion**: Matches are never deleted to maintain historical data
- **Pagination**: Support for paginated and non-paginated results

## Security Notes

- All input is validated and sanitized
- SQL injection protection through parameterized queries
- Player IDs are validated against existing users
- Proper HTTP status codes are used throughout
- Match integrity is enforced (players cannot play against themselves)

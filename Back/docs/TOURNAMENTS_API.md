# TOURNAMENTS API

## Overview
This API handles tournament management including creation, player registration, round-robin match generation, and ranking for the pong game system.

## Base URL
```
/tournaments
```

## Endpoints

### 1. Get All Tournaments
**GET** `/`

Returns all tournaments with owner information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Summer Championship 2025",
      "owner_id": 1,
      "owner_username": "alice",
      "status": "pending",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

### 2. Get Active Tournaments
**GET** `/active`

Returns tournaments with status 'pending' or 'ongoing'.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Friday Night Tournament",
      "owner_id": 2,
      "owner_username": "bob",
      "status": "ongoing",
      "created_at": "2025-01-27T09:00:00Z"
    }
  ]
}
```

### 3. Get Tournament by ID
**GET** `/:id`

Returns detailed tournament information including players and matches.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Summer Championship 2025",
    "owner_id": 1,
    "owner_username": "alice",
    "status": "pending",
    "created_at": "2025-01-27T10:00:00Z",
    "players": [
      {
        "tournament_id": 1,
        "user_id": 1,
        "username": "alice",
        "name": "Alice Silva",
        "points": 0
      }
    ],
    "matches": []
  }
}
```

### 4. Create Tournament
**POST** `/`

Creates a new tournament.

**Request Body:**
```json
{
  "name": "New Tournament",
  "owner_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "New Tournament",
    "owner_id": 1,
    "owner_username": "alice",
    "status": "pending",
    "created_at": "2025-01-27T12:00:00Z"
  }
}
```

### 5. Join Tournament
**POST** `/:id/join`

Adds a player to a pending tournament. (Max 8 players)

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined tournament"
}
```

**Error Cases:**
- Tournament not found (404)
- Tournament not pending (400)
- User already in tournament (400)
- Tournament already has 8 players (400)

### 6. Start Tournament
**POST** `/:id/start`

Starts a pending tournament by generating all-play-all matches (round-robin).

**Response:**
```json
{
  "success": true,
  "message": "Tournament started successfully"
}
```

**Requirements:**
- Tournament must be in 'pending' status
- Must have at least 2 players and at most 8 players
- Generates all unique pairs of matches (round-robin)
- Changes tournament status to 'ongoing'

### 7. Get User Tournaments
**GET** `/user/:userId`

Returns all tournaments where the user is either owner or participant.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Summer Championship 2025",
      "owner_id": 1,
      "owner_username": "alice",
      "status": "pending",
      "created_at": "2025-01-27T10:00:00Z",
      "user_role": "owner"
    },
    {
      "id": 2,
      "name": "Friday Night Tournament",
      "owner_id": 2,
      "owner_username": "bob",
      "status": "ongoing",
      "created_at": "2025-01-27T09:00:00Z",
      "user_role": "player"
    }
  ]
}
```

### 8. Get Final Ranking
**GET** `/:id/final-ranking`

Returns the final ranking for a tournament, applying tiebreaker rules.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tournament_id": 1,
      "user_id": 1,
      "username": "alice",
      "name": "Alice Silva",
      "points": 9,
      "victories": 3,
      "diff": 8,
      "made": 12
    },
    {
      "tournament_id": 1,
      "user_id": 2,
      "username": "bob",
      "name": "Bob Smith",
      "points": 9,
      "victories": 3,
      "diff": 8,
      "made": 12
    }
  ]
}
```

**Tiebreaker Rules:**
1. Order by points (desc)
2. If tied, order by number of victories (desc)
3. If still tied, order by points difference (points made - points suffered, desc)
4. If still tied, order by total points made (desc)
5. If all are tied, a new game is needed to determine the winner

## Tournament Status Flow

1. **pending** - Tournament created, accepting players (min 2, max 8)
2. **ongoing** - Tournament started, matches in progress
3. **finished** - Tournament completed, winner determined

## Player Status

- Only tracked by points in round-robin format

## Tournament Progression Logic

1. **Tournament Creation**: Owner creates tournament (status: pending)
2. **Player Registration**: Users join pending tournaments (up to 8)
3. **Tournament Start**: Generate all-play-all matches (round-robin)
4. **Match Completion**: Points are awarded (win: 3, loss: 0)
5. **Tournament End**: Rankings determined by points and tiebreakers

## Related Tables

- `tournaments` - Tournament information
- `tournament_players` - Player participation and points
- `matches` - Tournament matches (with tournament_id)

## Key Features

- **Round-Robin Match Generation**: All unique pairs play each other
- **Standing Calculation**: Real-time tournament rankings with tiebreakers
- **Player Limit**: 2-8 players per tournament

## Sample Tournament Flow

```
1. Create Tournament (pending)
2. Players join tournament (min 2, max 8)
3. Start tournament → Generate all-play-all matches
4. Matches completed → Points awarded
5. Rankings calculated with tiebreakers
6. Tournament finished
```

## Reserved User IDs
- **999998**: Local Player 2 (used for local two-player games)
- **999999**: AI Opponent (used for player vs CPU games)
- Reserved users are never included in tournament player lists or rankings.

## Tournament Logic
- Tournament progression is round-robin only. There is no knockout/elimination or round advancement logic.
- All players play each other, and final rankings are determined by points and tiebreakers as described below.

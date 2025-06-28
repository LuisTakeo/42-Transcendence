# TOURNAMENTS API

## Overview
This API handles tournament management including creation, player registration, match generation, and tournament progression for the pong game system.

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

Returns detailed tournament information including players, matches, and standings.

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
        "status": "active",
        "eliminated_in_round": null
      }
    ],
    "matches": [],
    "standings": [
      {
        "tournament_id": 1,
        "user_id": 1,
        "username": "alice",
        "name": "Alice Silva",
        "player_status": "active",
        "eliminated_in_round": null,
        "ranking_order": 2
      }
    ]
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

Adds a player to a pending tournament.

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

### 6. Start Tournament
**POST** `/:id/start`

Starts a pending tournament by generating first round matches.

**Response:**
```json
{
  "success": true,
  "message": "Tournament started successfully"
}
```

**Requirements:**
- Tournament must be in 'pending' status
- Must have at least 2 players
- Generates random matchmaking for first round
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
      "user_role": "owner",
      "player_status": null
    },
    {
      "id": 2,
      "name": "Friday Night Tournament",
      "owner_id": 2,
      "owner_username": "bob",
      "status": "ongoing",
      "created_at": "2025-01-27T09:00:00Z",
      "user_role": "player",
      "player_status": "eliminated"
    }
  ]
}
```

## Tournament Status Flow

1. **pending** - Tournament created, accepting players
2. **ongoing** - Tournament started, matches in progress
3. **finished** - Tournament completed, winner determined

## Player Status

- **active** - Still competing in tournament
- **eliminated** - Eliminated in a specific round
- **winner** - Tournament champion

## Tournament Progression Logic

1. **Tournament Creation**: Owner creates tournament (status: pending)
2. **Player Registration**: Users join pending tournaments
3. **Tournament Start**: Generate first round matches, random pairing
4. **Match Completion**: When matches finish, players are eliminated or advance
5. **Round Advancement**: Winners proceed to next round automatically
6. **Tournament End**: Last remaining player becomes winner

## Related Tables

- `tournaments` - Tournament information
- `tournament_players` - Player participation and status
- `tournament_rounds` - Round organization
- `matches` - Tournament matches (with tournament_id, round_number, match_position)

## Key Features

- **Automatic Bracket Generation**: Random first round pairing
- **Elimination Tracking**: Records which round each player was eliminated
- **Standing Calculation**: Real-time tournament rankings
- **Tournament Progression**: Automatic advancement to next rounds
- **Player Status Management**: Active, eliminated, winner states

## Sample Tournament Flow

```
1. Create Tournament (pending)
2. Players join tournament
3. Start tournament → Generate Round 1 matches
4. Matches completed → Players eliminated/advance
5. Generate Round 2 matches (if needed)
6. Continue until 1 winner remains
7. Tournament finished
```

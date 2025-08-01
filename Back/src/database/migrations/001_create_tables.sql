-- users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    is_online INTEGER DEFAULT 0,
    last_seen_at DATETIME,
    created_at DATETIME DEFAULT (datetime('now')),
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    google_id TEXT UNIQUE
);

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- friends
CREATE TABLE IF NOT EXISTS friends (
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    PRIMARY KEY (user1_id, user2_id),
    CHECK (user1_id < user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- matches
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_alias TEXT NOT NULL,
    player2_alias TEXT NOT NULL,
    winner_id INTEGER,
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    played_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

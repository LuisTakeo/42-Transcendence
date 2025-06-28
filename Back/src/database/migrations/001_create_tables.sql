-- users
CREATE TABLE IF NOT EXISTS users (
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

-- tournaments (must be before matches due to foreign key)
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending | ongoing | finished
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_players (
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- active | eliminated | winner
    eliminated_in_round INTEGER,
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
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
    tournament_id INTEGER,
    round_number INTEGER,
    match_position INTEGER,
    played_at DATETIME DEFAULT (datetime('now')),
    CHECK (player1_id <> player2_id),
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Helpful views for tournament queries
CREATE VIEW IF NOT EXISTS active_tournament_players AS
SELECT
    tp.tournament_id,
    tp.user_id,
    u.username,
    u.name,
    t.name as tournament_name,
    t.status as tournament_status
FROM tournament_players tp
JOIN users u ON tp.user_id = u.id
JOIN tournaments t ON tp.tournament_id = t.id
WHERE tp.status = 'active' AND t.status IN ('pending', 'ongoing');

CREATE VIEW IF NOT EXISTS ongoing_matches AS
SELECT
    m.*,
    u1.username as player1_username,
    u2.username as player2_username,
    t.name as tournament_name
FROM matches m
JOIN users u1 ON m.player1_id = u1.id
JOIN users u2 ON m.player2_id = u2.id
LEFT JOIN tournaments t ON m.tournament_id = t.id
WHERE m.winner_id IS NULL;

CREATE VIEW IF NOT EXISTS tournament_standings AS
SELECT
    tp.tournament_id,
    t.name as tournament_name,
    t.status as tournament_status,
    tp.user_id,
    u.username,
    u.name,
    tp.status as player_status,
    tp.eliminated_in_round,
    CASE
        WHEN tp.status = 'winner' THEN 1
        WHEN tp.status = 'active' THEN 2
        ELSE 3 + COALESCE(tp.eliminated_in_round, 0)
    END as ranking_order
FROM tournament_players tp
JOIN users u ON tp.user_id = u.id
JOIN tournaments t ON tp.tournament_id = t.id
ORDER BY tp.tournament_id, ranking_order;

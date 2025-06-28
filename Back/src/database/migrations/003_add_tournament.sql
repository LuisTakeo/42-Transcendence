-- Add tournament functionality to the database

-- tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending | ongoing | finished
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tournament_players table
CREATE TABLE IF NOT EXISTS tournament_players (
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- active | eliminated | winner
    eliminated_in_round INTEGER,
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tournament_rounds table
CREATE TABLE IF NOT EXISTS tournament_rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Add tournament-related columns to matches table
ALTER TABLE matches ADD COLUMN tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE matches ADD COLUMN round_number INTEGER;
ALTER TABLE matches ADD COLUMN match_position INTEGER;

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

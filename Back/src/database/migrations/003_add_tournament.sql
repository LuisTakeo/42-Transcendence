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

-- tournament_players table (refactored for round-robin)
CREATE TABLE IF NOT EXISTS tournament_players (
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Remove tournament_rounds table (no longer needed)
-- (table dropped or not created)

-- Add tournament-related columns to matches table
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we'll handle this in the application
ALTER TABLE matches ADD COLUMN tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE;
-- Remove round_number and match_position columns (not needed for round-robin)
-- (columns not added or dropped if present)

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
JOIN tournaments t ON tp.tournament_id = t.id;

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
    tp.points,
    RANK() OVER (PARTITION BY tp.tournament_id ORDER BY tp.points DESC) as ranking
FROM tournament_players tp
JOIN users u ON tp.user_id = u.id
JOIN tournaments t ON tp.tournament_id = t.id
ORDER BY tp.tournament_id, ranking;

-- Insert additional users and tournament mock data after tournament tables are created

-- Inserindo usuários adicionais para torneios
INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'John Doe', 'johndoe', 'john@example.com', '$2b$10$dummyhashforjohndoe1234567890', 'Spider-Man-Avatar.png', 1, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@example.com');

INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'Maria Silva', 'maria', 'maria@example.com', '$2b$10$dummyhashformaria1234567890abcd', 'Moana-Avatar.png', 0, datetime('now', '-30 minutes')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria@example.com');

-- Inserindo torneios (tournaments)
INSERT INTO tournaments (name, owner_id, status)
SELECT 'Summer Championship 2025', 1, 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Summer Championship 2025');

INSERT INTO tournaments (name, owner_id, status)
SELECT 'Friday Night Tournament', 2, 'ongoing'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Friday Night Tournament');

INSERT INTO tournaments (name, owner_id, status)
SELECT 'Beginner Cup', 3, 'finished'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Beginner Cup');

-- Inserindo jogadores dos torneios (tournament_players)
-- Tournament 1 (pending) - All players, no matches yet
INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 1);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 1, 2, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 1, 3, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 1, 4, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 4);

-- Tournament 2 (ongoing) - Example points
INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 2, 2, 6
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 2, 3, 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 2, 4, 3
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 4);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 2, 5, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 5);

-- Tournament 3 (finished) - Example points
INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 3, 1, 9
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 1);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 3, 2, 3
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 3, 3, 3
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, points)
SELECT 3, 4, 0
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 4);

-- Inserindo partidas de torneio
-- Tournament 2 (ongoing)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id)
SELECT 2, 3, 'bob', 'carol', 2, 3, 2, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 2 AND player2_id = 3 AND tournament_id = 2
);

INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id)
SELECT 4, 5, 'johndoe', 'maria', 4, 3, 1, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 4 AND player2_id = 5 AND tournament_id = 2
);

INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id)
SELECT 2, 4, 'bob', 'johndoe', 2, 2, 1, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 2 AND player2_id = 4 AND tournament_id = 2
);

-- Tournament 3 (finished)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id)
SELECT 1, 3, 'alice', 'carol', 1, 3, 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 3 AND tournament_id = 3
);

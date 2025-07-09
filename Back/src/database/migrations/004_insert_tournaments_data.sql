-- Insert additional users and tournament mock data after tournament tables are created

-- Inserindo usuários adicionais para torneios
INSERT INTO users (name, username, email, avatar_url, is_online, last_seen_at)
SELECT 'John Doe', 'johndoe', 'john@example.com', 'Spider-Man-Avatar.png', 1, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@example.com');

INSERT INTO users (name, username, email, avatar_url, is_online, last_seen_at)
SELECT 'Maria Silva', 'maria', 'maria@example.com', 'Moana-Avatar.png', 0, datetime('now', '-30 minutes')
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
-- Tournament 1 (pending) - All players active, no matches yet
INSERT INTO tournament_players (tournament_id, user_id, status)
SELECT 1, 1, 'active'
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 1);

INSERT INTO tournament_players (tournament_id, user_id, status)
SELECT 1, 2, 'active'
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, status)
SELECT 1, 3, 'active'
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, status)
SELECT 1, 4, 'active'
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 1 AND user_id = 4);

-- Tournament 2 (ongoing) - Some eliminated, some active
INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 2, 2, 'winner', NULL
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 2, 3, 'eliminated', 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 2, 4, 'eliminated', 2
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 4);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 2, 5, 'eliminated', 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 2 AND user_id = 5);

-- Tournament 3 (finished) - Final standings
INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 3, 1, 'winner', NULL
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 1);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 3, 2, 'eliminated', 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 2);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 3, 3, 'eliminated', 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 3);

INSERT INTO tournament_players (tournament_id, user_id, status, eliminated_in_round)
SELECT 3, 4, 'eliminated', 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = 3 AND user_id = 4);


-- Inserindo rounds dos torneios (tournament_rounds)
INSERT INTO tournament_rounds (tournament_id, round_number)
SELECT 2, 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_rounds WHERE tournament_id = 2 AND round_number = 1);

INSERT INTO tournament_rounds (tournament_id, round_number)
SELECT 2, 2
WHERE NOT EXISTS (SELECT 1 FROM tournament_rounds WHERE tournament_id = 2 AND round_number = 2);

INSERT INTO tournament_rounds (tournament_id, round_number)
SELECT 3, 1
WHERE NOT EXISTS (SELECT 1 FROM tournament_rounds WHERE tournament_id = 3 AND round_number = 1);

-- Inserindo partidas de torneio
-- Tournament 2 (ongoing) - Round 1 (Semifinal matches)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id, round_number, match_position)
SELECT 2, 3, 'bob', 'carol', 2, 3, 2, 2, 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 2 AND player2_id = 3 AND tournament_id = 2
);

INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id, round_number, match_position)
SELECT 4, 5, 'johndoe', 'maria', 4, 3, 1, 2, 1, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 4 AND player2_id = 5 AND tournament_id = 2
);

-- Tournament 2 (ongoing) - Round 2 (Final match)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id, round_number, match_position)
SELECT 2, 4, 'bob', 'johndoe', 2, 3, 0, 2, 2, 1
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 2 AND player2_id = 4 AND tournament_id = 2
);

-- Tournament 3 (finished) - Round 1 (Championship final)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score, tournament_id, round_number, match_position)
SELECT 1, 3, 'alice', 'carol', 1, 3, 1, 3, 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 3 AND tournament_id = 3
);

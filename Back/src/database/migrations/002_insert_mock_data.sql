-- Inserindo usuários mock
INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'Alice Silva', 'alice', 'alice@example.com', 'hashedpassword1', NULL, 1, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com');

INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'Bob Santos', 'bob', 'bob@example.com', 'hashedpassword2', NULL, 0, datetime('now', '-1 hour')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@example.com');

INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'Carol Lima', 'carol', 'carol@example.com', 'hashedpassword3', NULL, 0, datetime('now', '-2 hours')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carol@example.com');

INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'John Doe', 'johndoe', 'john@example.com', 'hashedpassword4', 'https://example.com/avatar.jpg', 1, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@example.com');

INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
SELECT 'Maria Silva', 'maria', 'maria@example.com', 'hashedpassword5', NULL, 0, datetime('now', '-30 minutes')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria@example.com');

-- Inserindo conversas (conversations)
INSERT INTO conversations (user1_id, user2_id)
SELECT 1, 2
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE user1_id = 1 AND user2_id = 2);

INSERT INTO conversations (user1_id, user2_id)
SELECT 1, 3
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE user1_id = 1 AND user2_id = 3);

-- Inserindo mensagens
INSERT INTO messages (conversation_id, sender_id, content)
SELECT 1, 1, 'Oi Bob, tudo bem?'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 1 AND sender_id = 1 AND content = 'Oi Bob, tudo bem?'
);

INSERT INTO messages (conversation_id, sender_id, content)
SELECT 1, 2, 'Oi Alice! Tudo ótimo, e você?'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 1 AND sender_id = 2 AND content = 'Oi Alice! Tudo ótimo, e você?'
);

INSERT INTO messages (conversation_id, sender_id, content)
SELECT 2, 3, 'Olá Alice, como vai?'
WHERE NOT EXISTS (
  SELECT 1 FROM messages WHERE conversation_id = 2 AND sender_id = 3 AND content = 'Olá Alice, como vai?'
);

-- Inserindo amizades (friends)
INSERT INTO friends (user1_id, user2_id)
SELECT 1, 2
WHERE NOT EXISTS (SELECT 1 FROM friends WHERE user1_id = 1 AND user2_id = 2);

INSERT INTO friends (user1_id, user2_id)
SELECT 1, 3
WHERE NOT EXISTS (SELECT 1 FROM friends WHERE user1_id = 1 AND user2_id = 3);

-- Inserindo partidas (matches) - only regular matches, no tournaments yet
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score)
SELECT 1, 2, 'alice', 'bob', 1, 3, 1
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 2 AND player1_score = 3 AND player2_score = 1
);

INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score)
SELECT 1, 3, 'alice', 'carol', NULL, 2, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 3 AND player1_score = 2 AND player2_score = 2
);

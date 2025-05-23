-- Inserindo usuários mock
INSERT INTO users (name, username, email, password_hash, avatar_url, is_online, last_seen_at)
VALUES
  ('Alice Silva', 'alice', 'alice@example.com', 'hashedpassword1', NULL, 1, datetime('now')),
  ('Bob Santos', 'bob', 'bob@example.com', 'hashedpassword2', NULL, 0, datetime('now', '-1 hour')),
  ('Carol Lima', 'carol', 'carol@example.com', 'hashedpassword3', NULL, 0, datetime('now', '-2 hours'));

-- Inserindo conversas (chats)
INSERT INTO chats (user1_id, user2_id)
VALUES
  (1, 2),
  (1, 3);

-- Inserindo mensagens
INSERT INTO messages (conversation_id, sender_id, content)
VALUES
  (1, 1, 'Oi Bob, tudo bem?'),
  (1, 2, 'Oi Alice! Tudo ótimo, e você?'),
  (2, 3, 'Olá Alice, como vai?');

-- Inserindo amizades (friends)
INSERT INTO friends (user1_id, user2_id)
VALUES
  (1, 2),
  (1, 3);

-- Inserindo partidas (matches)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score)
VALUES
  (1, 2, 'alice', 'bob', 1, 3, 1),
  (1, 3, 'alice', 'carol', NULL, 2, 2); -- empate

-- Inserindo usuários mock

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

-- Inserindo partidas (matches)
INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score)
SELECT 1, 2, 'alice', 'bob', 1, 3, 1
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 2 AND player1_score = 3 AND player2_score = 1
);

INSERT INTO matches (player1_id, player2_id, player1_alias, player2_alias, winner_id, player1_score, player2_score)
SELECT 1, 3, 'alice', 'carol', 1, 2, 2
WHERE NOT EXISTS (
  SELECT 1 FROM matches WHERE player1_id = 1 AND player2_id = 3 AND player1_score = 2 AND player2_score = 2
);

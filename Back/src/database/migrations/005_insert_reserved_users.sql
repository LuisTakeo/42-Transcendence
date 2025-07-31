-- Insert reserved users for AI Opponent and Local Player 2
INSERT OR IGNORE INTO users (id, name, username, email)
VALUES
  (4, 'AI Opponent', 'ai_opponent', 'ai@system.local', 'x'),
  (5, 'Local Player 2', 'local_player2', 'local2@system.local', 'x');

-- Insert reserved users for AI Opponent and Local Player 2
INSERT OR IGNORE INTO users (id, name, username, email, password_hash)
VALUES
  (999999, 'AI Opponent', 'ai_opponent', 'ai@system.local', 'x'),
  (999998, 'Local Player 2', 'local_player2', 'local2@system.local', 'x');

-- まず既存のテーブルを削除（順序に注意）
DROP TABLE IF EXISTS messages;  -- 先に外部キーを持つテーブルを削除
DROP TABLE IF EXISTS threads;   -- その後に参照されるテーブルを削除

-- threadsテーブルを先に作成
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  user_agent TEXT NOT NULL,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- その後にmessagesテーブルを作成
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(id)
); 
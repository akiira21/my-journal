-- +goose Up
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_hash VARCHAR(64),
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_sessions_session ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_chat_sessions_created;
DROP INDEX IF EXISTS idx_chat_sessions_session;
DROP TABLE IF EXISTS chat_sessions;
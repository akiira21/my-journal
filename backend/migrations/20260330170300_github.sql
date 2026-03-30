-- +goose Up
CREATE TABLE github_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    repo_name VARCHAR(255),
    title VARCHAR(500),
    description TEXT,
    url TEXT,
    event_data JSONB,
    occurred_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_github_activity_fetched ON github_activity(fetched_at DESC);
CREATE INDEX idx_github_activity_type ON github_activity(event_type);

-- +goose Down
DROP INDEX IF EXISTS idx_github_activity_type;
DROP INDEX IF EXISTS idx_github_activity_fetched;
DROP TABLE IF EXISTS github_activity;
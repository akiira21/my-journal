-- +goose Up
CREATE TABLE view_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_view_events_post ON view_events(post_id, viewed_at);
CREATE INDEX idx_view_events_time ON view_events(viewed_at);

-- +goose Down
DROP INDEX IF EXISTS idx_view_events_time;
DROP INDEX IF EXISTS idx_view_events_post;
DROP TABLE IF EXISTS view_events;
-- +goose Up
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash VARCHAR(64) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ip_hash, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_window ON rate_limits(ip_hash, endpoint, window_start);

-- +goose Down
DROP INDEX IF EXISTS idx_rate_limits_window;
DROP TABLE IF EXISTS rate_limits;
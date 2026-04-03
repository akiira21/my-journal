-- +goose Up
CREATE TABLE cache_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cache_keys_expires ON cache_keys(expires_at);

-- +goose Down
DROP INDEX IF EXISTS idx_cache_keys_expires;
DROP TABLE IF EXISTS cache_keys;
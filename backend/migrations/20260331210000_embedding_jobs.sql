-- +goose Up
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE embedding_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'pending',
    error TEXT,
    chunks_total INTEGER DEFAULT 0,
    chunks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_embedding_jobs_post ON embedding_jobs(post_id);
CREATE INDEX idx_embedding_jobs_status ON embedding_jobs(status);
CREATE INDEX idx_embedding_jobs_created ON embedding_jobs(created_at DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_embedding_jobs_created;
DROP INDEX IF EXISTS idx_embedding_jobs_status;
DROP INDEX IF EXISTS idx_embedding_jobs_post;
DROP TABLE IF EXISTS embedding_jobs;
DROP TYPE IF EXISTS job_status;
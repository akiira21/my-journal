-- name: CreateEmbeddingJob :one
INSERT INTO embedding_jobs (post_id, status, chunks_total)
VALUES ($1, 'pending', $2)
RETURNING id, post_id, status, error, chunks_total, chunks_completed, created_at, started_at, completed_at;

-- name: GetEmbeddingJobByID :one
SELECT id, post_id, status, error, chunks_total, chunks_completed, created_at, started_at, completed_at
FROM embedding_jobs
WHERE id = $1;

-- name: GetEmbeddingJobsByPostID :many
SELECT id, post_id, status, error, chunks_total, chunks_completed, created_at, started_at, completed_at
FROM embedding_jobs
WHERE post_id = $1
ORDER BY created_at DESC;

-- name: GetPendingEmbeddingJobs :many
SELECT id, post_id, status, error, chunks_total, chunks_completed, created_at, started_at, completed_at
FROM embedding_jobs
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT $1;

-- name: UpdateEmbeddingJobStatus :exec
UPDATE embedding_jobs
SET status = $2,
    error = COALESCE($3, error),
    started_at = CASE WHEN $2 = 'processing' THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN $2 = 'completed' OR $2 = 'failed' THEN NOW() ELSE completed_at END
WHERE id = $1;

-- name: UpdateEmbeddingJobProgress :exec
UPDATE embedding_jobs
SET chunks_completed = $2
WHERE id = $1;

-- name: GetLatestEmbeddingJobForPost :one
SELECT id, post_id, status, error, chunks_total, chunks_completed, created_at, started_at, completed_at
FROM embedding_jobs
WHERE post_id = $1
ORDER BY created_at DESC
LIMIT 1;
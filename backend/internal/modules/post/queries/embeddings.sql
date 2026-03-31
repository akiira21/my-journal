-- name: GetEmbeddingsByPostID :many
SELECT id, post_id, chunk_index, chunk_text, embedding
FROM post_embeddings
WHERE post_id = $1
ORDER BY chunk_index;

-- name: GetEmbeddingByID :one
SELECT id, post_id, chunk_index, chunk_text, embedding
FROM post_embeddings
WHERE id = $1;

-- name: CreateEmbedding :one
INSERT INTO post_embeddings (
  post_id, chunk_index, chunk_text, embedding
) VALUES (
  $1, $2, $3, $4
) RETURNING *;

-- name: CreateEmbeddings :copyfrom
INSERT INTO post_embeddings (
  post_id, chunk_index, chunk_text, embedding
) VALUES (
  $1, $2, $3, $4
);

-- name: DeleteEmbeddingsByPostID :exec
DELETE FROM post_embeddings WHERE post_id = $1;

-- name: SearchSimilarEmbeddings :many
SELECT 
  e.id,
  e.post_id,
  e.chunk_index,
  e.chunk_text,
  e.embedding,
  p.slug,
  p.title,
  p.description,
  1 - (e.embedding <=> $1) as similarity
FROM post_embeddings e
JOIN posts p ON p.id = e.post_id
WHERE p.is_archived = false AND p.published_at IS NOT NULL
ORDER BY e.embedding <=> $1
LIMIT $2;

-- name: SearchSimilarEmbeddingsByCategory :many
SELECT 
  e.id,
  e.post_id,
  e.chunk_index,
  e.chunk_text,
  e.embedding,
  p.slug,
  p.title,
  p.description,
  1 - (e.embedding <=> $1) as similarity
FROM post_embeddings e
JOIN posts p ON p.id = e.post_id
WHERE p.is_archived = false 
  AND p.published_at IS NOT NULL
  AND $2 = ANY(p.categories)
ORDER BY e.embedding <=> $1
LIMIT $3;
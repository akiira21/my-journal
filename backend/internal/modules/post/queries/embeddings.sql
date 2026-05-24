-- name: GetEmbeddingsByPostID :many
SELECT id, post_id, chunk_index, embedding
FROM post_embeddings
WHERE post_id = $1
ORDER BY chunk_index;

-- name: GetEmbeddingByID :one
SELECT id, post_id, chunk_index, embedding
FROM post_embeddings
WHERE id = $1;

-- name: CreateEmbedding :one
INSERT INTO post_embeddings (
  post_id, chunk_index, chunk_text, embedding
) VALUES (
  $1, $2, $3, $4
) RETURNING *;

-- name: DeleteEmbeddingsByPostID :exec
DELETE FROM post_embeddings WHERE post_id = $1;

-- name: SearchSimilarEmbeddings :many
SELECT 
  e.id,
  e.post_id,
  e.chunk_index,
  e.embedding,
  p.slug,
  p.title,
  p.description,
  (1 - (e.embedding <=> $1))::double precision as similarity
FROM post_embeddings e
JOIN posts p ON p.id = e.post_id
WHERE p.is_archived = false
ORDER BY e.embedding <=> $1
LIMIT $2;

-- name: SearchSimilarEmbeddingsByCategory :many
SELECT 
  e.id,
  e.post_id,
  e.chunk_index,
  e.embedding,
  p.slug,
  p.title,
  p.description,
  (1 - (e.embedding <=> $1))::double precision as similarity
FROM post_embeddings e
JOIN posts p ON p.id = e.post_id
WHERE p.is_archived = false 
  AND $2 = ANY(p.categories)
ORDER BY e.embedding <=> $1
LIMIT $3;

-- Hybrid search: BM25 (keyword) + vector similarity via Reciprocal Rank Fusion
-- $1 = text query (plain string), $2 = query embedding vector, $3 = limit
-- name: SearchHybrid :many
WITH keyword_results AS (
  SELECT 
    post_id,
    row_number() OVER (ORDER BY ts_rank_cd(search_vector, plainto_tsquery('english', $1)) DESC) as rank
  FROM post_embeddings
  WHERE search_vector @@ plainto_tsquery('english', $1)
    AND chunk_text IS NOT NULL
  ORDER BY ts_rank_cd(search_vector, plainto_tsquery('english', $1)) DESC
  LIMIT 50
),
vector_results AS (
  SELECT 
    e.post_id,
    row_number() OVER (ORDER BY e.embedding <=> $2) as rank
  FROM post_embeddings e
  ORDER BY e.embedding <=> $2
  LIMIT 50
),
combined AS (
  SELECT post_id, rank FROM keyword_results
  UNION ALL
  SELECT post_id, rank FROM vector_results
)
SELECT 
  p.id,
  p.slug,
  p.title,
  p.description,
  p.cover_url,
  p.categories,
  p.tags,
  p.featured,
  p.view_count,
  p.read_time_minutes,
  p.published_at,
  SUM(1.0 / (60.0 + combined.rank))::double precision as rrf_score
FROM combined
JOIN posts p ON p.id = combined.post_id
WHERE p.is_archived = false
GROUP BY 
  p.id, p.slug, p.title, p.description, p.cover_url,
  p.categories, p.tags, p.featured, p.view_count,
  p.read_time_minutes, p.published_at
ORDER BY rrf_score DESC
LIMIT $3;
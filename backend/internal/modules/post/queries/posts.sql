-- name: GetPostBySlug :one
SELECT * FROM posts
WHERE slug = $1 AND is_archived = false;

-- name: GetPostByID :one
SELECT * FROM posts
WHERE id = $1;

-- name: ListPosts :many
SELECT id, slug, title, description, cover_url, categories, tags, featured, view_count, read_time_minutes, published_at
FROM posts
WHERE is_archived = false
ORDER BY published_at DESC NULLS LAST, created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListFeaturedPosts :many
SELECT id, slug, title, description, cover_url, categories, tags, featured, view_count, read_time_minutes, published_at
FROM posts
WHERE featured = true AND is_archived = false AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT $1;

-- name: ListPostsByCategory :many
SELECT id, slug, title, description, cover_url, categories, tags, featured, view_count, read_time_minutes, published_at
FROM posts
WHERE $1 = ANY(categories) AND is_archived = false AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT $2 OFFSET $3;

-- name: ListPostsByTag :many
SELECT id, slug, title, description, cover_url, categories, tags, featured, view_count, read_time_minutes, published_at
FROM posts
WHERE $1 = ANY(tags) AND is_archived = false AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT $2 OFFSET $3;

-- name: SearchPosts :many
SELECT id, slug, title, description, cover_url, categories, tags, featured, view_count, read_time_minutes, published_at
FROM posts
WHERE 
  (title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
  AND is_archived = false 
  AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT $2 OFFSET $3;

-- name: CreatePost :one
INSERT INTO posts (
  slug, title, description, content_url, cover_url, categories, tags, featured, read_time_minutes, published_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: UpdatePost :one
UPDATE posts SET
  title = COALESCE(sqlc.narg('title'), title),
  description = COALESCE(sqlc.narg('description'), description),
  content_url = COALESCE(sqlc.narg('content_url'), content_url),
  cover_url = COALESCE(sqlc.narg('cover_url'), cover_url),
  categories = COALESCE(sqlc.narg('categories'), categories),
  tags = COALESCE(sqlc.narg('tags'), tags),
  featured = COALESCE(sqlc.narg('featured'), featured),
  read_time_minutes = COALESCE(sqlc.narg('read_time_minutes'), read_time_minutes),
  published_at = COALESCE(sqlc.narg('published_at'), published_at),
  is_archived = COALESCE(sqlc.narg('is_archived'), is_archived),
  updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: IncrementViewCount :exec
UPDATE posts SET view_count = view_count + 1
WHERE id = $1;

-- name: DeletePost :exec
DELETE FROM posts WHERE id = $1;

-- name: ArchivePost :exec
UPDATE posts SET is_archived = true, updated_at = NOW()
WHERE id = $1;

-- name: GetTotalPostCount :one
SELECT COUNT(*) FROM posts WHERE is_archived = false;
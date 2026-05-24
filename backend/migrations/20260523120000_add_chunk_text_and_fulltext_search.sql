-- +goose Up
-- Add chunk_text back to post_embeddings for keyword/BM25 search
ALTER TABLE post_embeddings ADD COLUMN chunk_text TEXT;

-- Add tsvector search index for full-text search on chunks
ALTER TABLE post_embeddings ADD COLUMN search_vector tsvector;

CREATE INDEX idx_post_embeddings_search ON post_embeddings USING GIN(search_vector);

-- Auto-update search_vector when chunk_text changes
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION update_post_embedding_search_vector()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.chunk_text, ''));
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER trg_post_embedding_search_vector
BEFORE INSERT OR UPDATE OF chunk_text ON post_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_post_embedding_search_vector();

-- Backfill existing rows (will be no-op on fresh DB)
UPDATE post_embeddings SET chunk_text = '' WHERE chunk_text IS NULL;
UPDATE post_embeddings SET search_vector = to_tsvector('english', COALESCE(chunk_text, ''));

-- Also add full-text search to posts table for public blog search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.categories, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER trg_post_search_vector
BEFORE INSERT OR UPDATE OF title, description, categories, tags ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_search_vector();

-- Backfill existing rows (will be no-op on fresh DB)
UPDATE posts SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(categories, ' '), '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C');

-- +goose Down
DROP TRIGGER IF EXISTS trg_post_search_vector ON posts;
DROP FUNCTION IF EXISTS update_post_search_vector;
DROP INDEX IF EXISTS idx_posts_search;
ALTER TABLE posts DROP COLUMN IF EXISTS search_vector;

DROP TRIGGER IF EXISTS trg_post_embedding_search_vector ON post_embeddings;
DROP FUNCTION IF EXISTS update_post_embedding_search_vector;
DROP INDEX IF EXISTS idx_post_embeddings_search;
ALTER TABLE post_embeddings DROP COLUMN IF EXISTS search_vector;
ALTER TABLE post_embeddings DROP COLUMN IF EXISTS chunk_text;

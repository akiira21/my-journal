-- +goose Up
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    categories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false
);

CREATE TABLE post_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_post_embeddings_post ON post_embeddings(post_id);
CREATE INDEX idx_post_embeddings_vector ON post_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- +goose Down
DROP INDEX IF EXISTS idx_post_embeddings_vector;
DROP INDEX IF EXISTS idx_post_embeddings_post;
DROP INDEX IF EXISTS idx_posts_published;
DROP INDEX IF EXISTS idx_posts_slug;
DROP TABLE IF EXISTS post_embeddings;
DROP TABLE IF EXISTS posts;
-- +goose Up
ALTER TABLE post_embeddings DROP COLUMN chunk_text;

-- +goose Down
ALTER TABLE post_embeddings ADD COLUMN chunk_text TEXT NOT NULL DEFAULT '';
-- +goose Up
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    raw_readme TEXT,
    ai_summary TEXT,
    ai_summary_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_sort ON projects(sort_order);

-- +goose Down
DROP INDEX IF EXISTS idx_projects_sort;
DROP INDEX IF EXISTS idx_projects_featured;
DROP TABLE IF EXISTS projects;
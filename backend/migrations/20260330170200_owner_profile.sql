-- +goose Up
CREATE TABLE owner_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_username VARCHAR(100),
    leetcode_username VARCHAR(100),
    display_name VARCHAR(200),
    bio TEXT,
    skills JSONB DEFAULT '[]',
    current_learning JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    resume_url TEXT,
    raw_readme TEXT,
    ai_summary TEXT,
    ai_summary_generated_at TIMESTAMPTZ,
    assistant_name VARCHAR(100) DEFAULT 'Assistant',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS owner_profile;
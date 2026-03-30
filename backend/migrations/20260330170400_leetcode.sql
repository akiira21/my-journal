-- +goose Up
CREATE TABLE leetcode_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    ranking INTEGER,
    recent_submissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leetcode_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500),
    difficulty VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    solved BOOLEAN DEFAULT false,
    solved_at TIMESTAMPTZ,
    solution_url TEXT
);

CREATE INDEX idx_leetcode_problems_solved ON leetcode_problems(solved);
CREATE INDEX idx_leetcode_problems_difficulty ON leetcode_problems(difficulty);

-- +goose Down
DROP INDEX IF EXISTS idx_leetcode_problems_difficulty;
DROP INDEX IF EXISTS idx_leetcode_problems_solved;
DROP TABLE IF EXISTS leetcode_problems;
DROP TABLE IF EXISTS leetcode_stats;
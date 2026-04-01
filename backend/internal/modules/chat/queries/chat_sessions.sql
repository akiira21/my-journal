-- name: CreateChatSession :one
INSERT INTO chat_sessions (session_id, ip_hash)
VALUES ($1, $2)
ON CONFLICT (session_id) DO UPDATE
SET session_id = EXCLUDED.session_id
RETURNING id, session_id, ip_hash, messages, created_at, last_message_at;

-- name: GetChatSession :one
SELECT id, session_id, ip_hash, messages, created_at, last_message_at
FROM chat_sessions
WHERE session_id = $1;

-- name: UpdateChatMessages :exec
UPDATE chat_sessions
SET messages = $2,
    last_message_at = NOW()
WHERE session_id = $1;

-- name: GetOwnerProfile :one
SELECT id, github_username, leetcode_username, display_name, bio, skills, current_learning, social_links, resume_url, raw_readme, ai_summary, ai_summary_generated_at, assistant_name, updated_at
FROM owner_profile
LIMIT 1;
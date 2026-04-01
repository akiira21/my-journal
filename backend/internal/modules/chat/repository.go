package chat

import (
	"context"
	"encoding/json"
	"time"

	"github.com/akiira21/my-journal-backend/internal/modules/chat/chatdb"
	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type Message struct {
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type ChatSession struct {
	ID            uuid.UUID  `json:"id"`
	SessionID     string     `json:"session_id"`
	Messages      []Message  `json:"messages"`
	CreatedAt     time.Time  `json:"created_at"`
	LastMessageAt *time.Time `json:"last_message_at"`
}

type OwnerProfile struct {
	ID               uuid.UUID
	GithubUsername   string
	LeetcodeUsername string
	DisplayName      string
	Bio              string
	Skills           []string
	CurrentLearning  []string
	SocialLinks      map[string]string
	ResumeURL        string
	RawReadme        string
	AiSummary        string
	AssistantName    string
}

type Repository struct {
	q        *chatdb.Queries
	postRepo *post.Repository
}

func NewRepository(db *database.DB, postRepo *post.Repository) *Repository {
	return &Repository{
		q:        chatdb.New(db.Pool),
		postRepo: postRepo,
	}
}

func (r *Repository) CreateSession(ctx context.Context, sessionID string, ipHash *string) (*ChatSession, error) {
	var ipHashText pgtype.Text
	if ipHash != nil {
		ipHashText = pgtype.Text{String: *ipHash, Valid: true}
	}

	session, err := r.q.CreateChatSession(ctx, chatdb.CreateChatSessionParams{
		SessionID: sessionID,
		IpHash:    ipHashText,
	})
	if err != nil {
		return nil, err
	}

	return toChatSession(session), nil
}

func (r *Repository) GetSession(ctx context.Context, sessionID string) (*ChatSession, error) {
	session, err := r.q.GetChatSession(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	return toChatSession(session), nil
}

func (r *Repository) UpdateMessages(ctx context.Context, sessionID string, messages []Message) error {
	msgBytes, err := json.Marshal(messages)
	if err != nil {
		return err
	}

	return r.q.UpdateChatMessages(ctx, chatdb.UpdateChatMessagesParams{
		SessionID: sessionID,
		Messages:  msgBytes,
	})
}

func (r *Repository) GetOwnerProfile(ctx context.Context) (*OwnerProfile, error) {
	profile, err := r.q.GetOwnerProfile(ctx)
	if err != nil {
		return nil, err
	}

	return toOwnerProfile(profile), nil
}

func (r *Repository) SearchSimilarPosts(ctx context.Context, embedding []float32, limit int) ([]post.SearchResult, error) {
	return r.postRepo.SearchSimilar(ctx, embedding, limit)
}

func toChatSession(s chatdb.ChatSession) *ChatSession {
	var messages []Message
	if len(s.Messages) > 0 {
		json.Unmarshal(s.Messages, &messages)
	}

	var lastMsgAt *time.Time
	if s.LastMessageAt.Valid {
		lastMsgAt = &s.LastMessageAt.Time
	}

	return &ChatSession{
		ID:            s.ID.Bytes,
		SessionID:     s.SessionID,
		Messages:      messages,
		CreatedAt:     s.CreatedAt.Time,
		LastMessageAt: lastMsgAt,
	}
}

func toOwnerProfile(p chatdb.OwnerProfile) *OwnerProfile {
	var skills []string
	if len(p.Skills) > 0 {
		json.Unmarshal(p.Skills, &skills)
	}

	var currentLearning []string
	if len(p.CurrentLearning) > 0 {
		json.Unmarshal(p.CurrentLearning, &currentLearning)
	}

	var socialLinks map[string]string
	if len(p.SocialLinks) > 0 {
		json.Unmarshal(p.SocialLinks, &socialLinks)
	}

	return &OwnerProfile{
		ID:               p.ID.Bytes,
		GithubUsername:   p.GithubUsername.String,
		LeetcodeUsername: p.LeetcodeUsername.String,
		DisplayName:      p.DisplayName.String,
		Bio:              p.Bio.String,
		Skills:           skills,
		CurrentLearning:  currentLearning,
		SocialLinks:      socialLinks,
		ResumeURL:        p.ResumeUrl.String,
		RawReadme:        p.RawReadme.String,
		AiSummary:        p.AiSummary.String,
		AssistantName:    p.AssistantName.String,
	}
}

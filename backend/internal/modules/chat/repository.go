package chat

import (
	"context"
	"encoding/json"
	"time"

	"github.com/akiira21/my-journal-backend/internal/modules/chat/chatdb"
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

type Repository struct {
	q *chatdb.Queries
}

func NewRepository(db *database.DB) *Repository {
	return &Repository{
		q: chatdb.New(db.Pool),
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

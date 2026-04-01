package chat

import (
	"context"
	"fmt"
	"strings"

	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	"github.com/google/uuid"
)

type Service struct {
	repo     *Repository
	openai   *openai.Client
	postRepo *post.Repository
}

func NewService(repo *Repository, openaiClient *openai.Client, postRepo *post.Repository) *Service {
	return &Service{
		repo:     repo,
		openai:   openaiClient,
		postRepo: postRepo,
	}
}

type ChatRequest struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
}

type ChatResponse struct {
	Message   string   `json:"message"`
	Sources   []Source `json:"sources,omitempty"`
	SessionID string   `json:"session_id"`
}

type Source struct {
	PostID    uuid.UUID `json:"post_id"`
	PostSlug  string    `json:"post_slug"`
	Title     string    `json:"title"`
	ChunkText string    `json:"chunk_text"`
	Score     float64   `json:"score"`
}

type ChatContext struct {
	Session        *ChatSession
	QueryEmbedding []float32
	Results        []post.SearchResult
	OwnerProfile   *OwnerProfile
	SystemPrompt   string
}

func (s *Service) CreateSession(ctx context.Context, sessionID string, ipHash *string) (*ChatSession, error) {
	return s.repo.CreateSession(ctx, sessionID, ipHash)
}

func (s *Service) GetSession(ctx context.Context, sessionID string) (*ChatSession, error) {
	return s.repo.GetSession(ctx, sessionID)
}

func (s *Service) PrepareChatContext(ctx context.Context, req ChatRequest) (*ChatContext, error) {
	session, err := s.repo.GetSession(ctx, req.SessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	queryEmbedding, err := s.openai.GenerateEmbedding(ctx, req.Message)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	results, err := s.repo.SearchSimilarPosts(ctx, queryEmbedding, 5)
	if err != nil {
		return nil, fmt.Errorf("failed to search similar posts: %w", err)
	}

	ownerProfile, err := s.repo.GetOwnerProfile(ctx)
	if err != nil {
		ownerProfile = &OwnerProfile{AssistantName: "Assistant"}
	}

	contextText := s.buildContext(results)
	systemPrompt := s.buildSystemPrompt(ownerProfile, contextText)

	return &ChatContext{
		Session:        session,
		QueryEmbedding: queryEmbedding,
		Results:        results,
		OwnerProfile:   ownerProfile,
		SystemPrompt:   systemPrompt,
	}, nil
}

func (s *Service) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	chatCtx, err := s.PrepareChatContext(ctx, req)
	if err != nil {
		return nil, err
	}

	history := make([]openai.ChatMessage, len(chatCtx.Session.Messages))
	for i, m := range chatCtx.Session.Messages {
		history[i] = openai.ChatMessage{Role: m.Role, Content: m.Content}
	}

	response, err := s.openai.ChatWithHistory(ctx, chatCtx.SystemPrompt, append(history, openai.ChatMessage{
		Role:    "user",
		Content: req.Message,
	}))
	if err != nil {
		return nil, fmt.Errorf("failed to generate response: %w", err)
	}

	newMessages := append(chatCtx.Session.Messages, []Message{
		{Role: "user", Content: req.Message},
		{Role: "assistant", Content: response},
	}...)

	if err := s.repo.UpdateMessages(ctx, req.SessionID, newMessages); err != nil {
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	sources := make([]Source, 0, len(chatCtx.Results))
	for _, r := range chatCtx.Results {
		if r.Score > 0.7 {
			sources = append(sources, Source{
				PostID:    r.Post.ID,
				PostSlug:  r.Post.Slug,
				Title:     r.Post.Title,
				ChunkText: r.ChunkText,
				Score:     r.Score,
			})
		}
	}

	return &ChatResponse{
		Message:   response,
		Sources:   sources,
		SessionID: req.SessionID,
	}, nil
}

func (s *Service) ChatStream(ctx context.Context, req ChatRequest) (<-chan openai.StreamChunk, *ChatContext, error) {
	chatCtx, err := s.PrepareChatContext(ctx, req)
	if err != nil {
		return nil, nil, err
	}

	history := make([]openai.ChatMessage, len(chatCtx.Session.Messages))
	for i, m := range chatCtx.Session.Messages {
		history[i] = openai.ChatMessage{Role: m.Role, Content: m.Content}
	}

	stream := s.openai.ChatWithHistoryStream(ctx, chatCtx.SystemPrompt, append(history, openai.ChatMessage{
		Role:    "user",
		Content: req.Message,
	}))

	return stream, chatCtx, nil
}

func (s *Service) SaveMessages(ctx context.Context, sessionID string, messages []Message) error {
	return s.repo.UpdateMessages(ctx, sessionID, messages)
}

func (s *Service) buildContext(results []post.SearchResult) string {
	if len(results) == 0 {
		return "No relevant blog posts found."
	}

	var sb strings.Builder
	sb.WriteString("Relevant blog posts:\n\n")

	for i, r := range results {
		if i >= 5 {
			break
		}
		sb.WriteString(fmt.Sprintf("Title: %s\n", r.Post.Title))
		if r.Post.Description != nil {
			sb.WriteString(fmt.Sprintf("Description: %s\n", *r.Post.Description))
		}
		sb.WriteString(fmt.Sprintf("Content excerpt: %s\n\n", r.ChunkText))
	}

	return sb.String()
}

func (s *Service) buildSystemPrompt(owner *OwnerProfile, context string) string {
	assistantName := owner.AssistantName
	if assistantName == "" {
		assistantName = "Assistant"
	}

	var ownerInfo strings.Builder
	if owner.DisplayName != "" {
		ownerInfo.WriteString(fmt.Sprintf("Name: %s\n", owner.DisplayName))
	}
	if owner.Bio != "" {
		ownerInfo.WriteString(fmt.Sprintf("Bio: %s\n", owner.Bio))
	}
	if len(owner.Skills) > 0 {
		ownerInfo.WriteString(fmt.Sprintf("Skills: %s\n", strings.Join(owner.Skills, ", ")))
	}
	if len(owner.CurrentLearning) > 0 {
		ownerInfo.WriteString(fmt.Sprintf("Currently learning: %s\n", strings.Join(owner.CurrentLearning, ", ")))
	}
	if owner.GithubUsername != "" {
		ownerInfo.WriteString(fmt.Sprintf("GitHub: %s\n", owner.GithubUsername))
	}
	if owner.LeetcodeUsername != "" {
		ownerInfo.WriteString(fmt.Sprintf("LeetCode: %s\n", owner.LeetcodeUsername))
	}

	return fmt.Sprintf(`You are %s, an AI assistant for a personal blog and portfolio. You help visitors learn about the owner's work, blog posts, projects, and skills.

Owner Profile:
%s

%s

Guidelines:
- Answer questions based on the provided context from blog posts
- Be helpful and informative
- If information is not in the context, say so honestly
- Keep responses concise but thorough
- When referencing a blog post, mention its title
- Format code examples properly
- Be friendly and engaging`, assistantName, ownerInfo.String(), context)
}

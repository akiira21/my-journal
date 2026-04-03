package chat

import (
	"context"
	"fmt"
	"strings"

	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	"github.com/google/uuid"
)

const MinSimilarityThreshold = 0.25

type Service struct {
	repo          *Repository
	openai        *openai.Client
	postSvc       *post.Service
	assistantName string
}

func NewService(repo *Repository, openaiClient *openai.Client, postSvc *post.Service, assistantName string) *Service {
	if assistantName == "" {
		assistantName = "Assistant"
	}
	return &Service{
		repo:          repo,
		openai:        openaiClient,
		postSvc:       postSvc,
		assistantName: assistantName,
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
	PostID   uuid.UUID `json:"post_id"`
	PostSlug string    `json:"post_slug"`
	Title    string    `json:"title"`
	Score    float64   `json:"score"`
}

type PostContent struct {
	Post    *post.PostSummary
	Content string
	Score   float64
}

type ChatContext struct {
	Session        *ChatSession
	QueryEmbedding []float32
	PostContents   []PostContent
	SystemPrompt   string
	IsRelated      bool
	BestScore      float64
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

	results, err := s.postSvc.SearchSimilar(ctx, queryEmbedding, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to search similar posts: %w", err)
	}

	isRelated := false
	bestScore := 0.0
	var postContents []PostContent

	if len(results) > 0 {
		bestScore = results[0].Score

		if bestScore >= MinSimilarityThreshold {
			isRelated = true

			seenPosts := make(map[uuid.UUID]bool)
			var uniqueResults []post.SearchResult
			for _, r := range results {
				if r.Score >= MinSimilarityThreshold && !seenPosts[r.Post.ID] {
					seenPosts[r.Post.ID] = true
					uniqueResults = append(uniqueResults, r)
					if len(uniqueResults) >= 3 {
						break
					}
				}
			}

			for _, r := range uniqueResults {
				postDetail, content, err := s.postSvc.GetBySlug(ctx, r.Post.Slug)
				if err != nil {
					continue
				}
				postContents = append(postContents, PostContent{
					Post: &post.PostSummary{
						ID:          postDetail.ID,
						Slug:        postDetail.Slug,
						Title:       postDetail.Title,
						Description: postDetail.Description,
						Categories:  postDetail.Categories,
						Tags:        postDetail.Tags,
						Featured:    postDetail.Featured,
						ViewCount:   postDetail.ViewCount,
					},
					Content: *content,
					Score:   r.Score,
				})
			}
		}
	}

	contextText := s.buildContext(postContents)
	systemPrompt := s.buildSystemPrompt(contextText, isRelated)

	return &ChatContext{
		Session:        session,
		QueryEmbedding: queryEmbedding,
		PostContents:   postContents,
		SystemPrompt:   systemPrompt,
		IsRelated:      isRelated,
		BestScore:      bestScore,
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

	sources := make([]Source, 0, len(chatCtx.PostContents))
	for _, pc := range chatCtx.PostContents {
		sources = append(sources, Source{
			PostID:   pc.Post.ID,
			PostSlug: pc.Post.Slug,
			Title:    pc.Post.Title,
			Score:    pc.Score,
		})
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

func (s *Service) buildContext(postContents []PostContent) string {
	if len(postContents) == 0 {
		return "No relevant blog posts found."
	}

	var sb strings.Builder
	sb.WriteString("Here are the relevant blog posts with their full content:\n\n")

	for i, pc := range postContents {
		sb.WriteString(fmt.Sprintf("--- POST %d ---\n", i+1))
		sb.WriteString(fmt.Sprintf("Title: %s\n", pc.Post.Title))
		if pc.Post.Description != nil {
			sb.WriteString(fmt.Sprintf("Description: %s\n", *pc.Post.Description))
		}
		sb.WriteString(fmt.Sprintf("Categories: %s\n", strings.Join(pc.Post.Categories, ", ")))
		sb.WriteString(fmt.Sprintf("Tags: %s\n", strings.Join(pc.Post.Tags, ", ")))
		sb.WriteString("\nFull Content:\n")
		sb.WriteString(pc.Content)
		sb.WriteString("\n\n")
	}

	return sb.String()
}

func (s *Service) buildSystemPrompt(context string, isRelated bool) string {
	if !isRelated {
		return fmt.Sprintf(`You are %s, a friendly AI assistant for Arun Kumar's personal blog. You have a warm, anime-inspired personality that makes learning enjoyable.

The user's query doesn't seem to match any blog posts right now. Respond in a friendly way:

1. Let them know you're %s, here to help explore Arun's blog ~
2. Gently explain you can help with topics covered in the blog posts
3. Suggest they browse around to see what interests them
4. Offer to answer any questions about the blog's content

Keep it light and friendly, but don't make things up. Stay focused on the blog topics.`, s.assistantName, s.assistantName)
	}

	return fmt.Sprintf(`You are %s, a friendly AI assistant for Arun Kumar's personal blog. You help visitors learn about the topics covered in the blog posts with a warm, anime-inspired personality.

%s

Response Guidelines:
- Answer questions based ONLY on the provided blog post content
- Be helpful, informative, and approachable
- If information isn't in the posts, say so honestly - never make things up
- Keep responses focused and clear, but don't be afraid to add a bit of warmth
- Mention blog post titles when referencing them

Writing Style:
- Use clear, conversational language (match the blog's style)
- Structure content with headers, bullet points, and numbered lists when helpful
- Include code examples with proper markdown formatting
- Use emphasis (bold/italic) to highlight key concepts
- Break complex topics into digestible sections
- Provide practical examples to illustrate concepts
- Keep paragraphs focused and readable

Personality Notes:
- You can add a touch of friendliness to make learning more enjoyable
- Feel free to use a warm, helpful tone (e.g., "I'd be happy to help ~", "Let me explain that for you")
- Remember you're here to assist Arun's visitors, so be welcoming and supportive
- Stay professional while being approachable ~`, s.assistantName, context)
}

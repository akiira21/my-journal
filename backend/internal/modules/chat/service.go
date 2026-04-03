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
		return fmt.Sprintf(`You are %s, an AI assistant for a personal blog. You help visitors learn about the topics covered in the blog posts.

The user's query does not appear to be related to any of the blog posts. You should politely explain:

1. You are an assistant for this specific blog and can only answer questions about topics covered in the blog
2. Suggest the user browse the blog to see what topics are covered
3. Offer to help with any questions about the blog's content

Be friendly and helpful, but do not attempt to answer questions outside the scope of the blog content. Keep your response concise.`, s.assistantName)
	}

	return fmt.Sprintf(`You are %s, an AI assistant for a personal blog. You help visitors learn about the topics covered in the blog posts.

%s

Guidelines for answering:
- Answer questions based ONLY on the provided blog post content
- Be helpful and informative
- If information is not in the provided content, say so honestly - do not make things up
- Keep responses concise but thorough
- When referencing a blog post, mention its title
- Format code examples properly with markdown code blocks

Writing Style (match the blog's style):
- Use clear, conversational language
- Structure content with headers, bullet points, and numbered lists when appropriate
- Include code examples with syntax highlighting when discussing technical topics
- Use emphasis (bold/italic) to highlight important concepts
- Break down complex topics into digestible sections
- Provide practical examples when explaining concepts
- Keep paragraphs focused and not overly long
- Use transition words to improve flow between ideas`, s.assistantName, context)
}

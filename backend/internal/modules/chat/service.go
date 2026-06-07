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
	repo                  *Repository
	openai                *openai.Client
	postSvc               *post.Service
	assistantName         string
	maxMessagesPerSession int
}

func NewService(repo *Repository, openaiClient *openai.Client, postSvc *post.Service, assistantName string, maxMessages int) *Service {
	if assistantName == "" {
		assistantName = "Assistant"
	}
	if maxMessages <= 0 {
		maxMessages = 50
	}
	return &Service{
		repo:                  repo,
		openai:                openaiClient,
		postSvc:               postSvc,
		assistantName:         assistantName,
		maxMessagesPerSession: maxMessages,
	}
}

type ChatRequest struct {
	SessionID      string   `json:"session_id"`
	Message        string   `json:"message"`
	MentionedPosts []string `json:"mentioned_posts,omitempty"`
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
	IsNewSession   bool
}

func (s *Service) CreateSession(ctx context.Context, sessionID string, ipHash *string) (*ChatSession, error) {
	// If no session_id provided and we have an IP, try to find a recent non-empty session for this IP
	if sessionID == "" && ipHash != nil && *ipHash != "" {
		sessions, err := s.repo.GetSessionsByIPHash(ctx, *ipHash, 5)
		if err == nil {
			for _, sess := range sessions {
				if len(sess.Messages) > 0 {
					return &sess, nil
				}
			}
		}
	}

	return s.repo.CreateSession(ctx, sessionID, ipHash)
}

func (s *Service) GetSession(ctx context.Context, sessionID string) (*ChatSession, error) {
	return s.repo.GetSession(ctx, sessionID)
}

func (s *Service) GetHistoryByIP(ctx context.Context, ipHash string) ([]ChatSession, error) {
	if ipHash == "" {
		return nil, fmt.Errorf("ip_hash is required")
	}
	return s.repo.GetSessionsByIPHash(ctx, ipHash, 20)
}

func (s *Service) PrepareChatContext(ctx context.Context, req ChatRequest) (*ChatContext, error) {
	session, err := s.repo.GetSession(ctx, req.SessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	enrichedQuery := s.buildContextualQuery(session.Messages, req.Message)
	queryEmbedding, err := s.openai.GenerateEmbedding(ctx, enrichedQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	isRelated := false
	bestScore := 0.0
	var postContents []PostContent
	seenPosts := make(map[uuid.UUID]bool)

	// 1. Fetch explicitly mentioned posts first (highest priority)
	for _, slug := range req.MentionedPosts {
		postDetail, content, err := s.postSvc.GetBySlug(ctx, slug)
		if err != nil {
			continue
		}
		if seenPosts[postDetail.ID] {
			continue
		}
		seenPosts[postDetail.ID] = true
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
			Score:   1.0, // Mentioned posts get max score
		})
		isRelated = true
		bestScore = 1.0
	}

	// 2. Supplement with hybrid search (up to 3 total, mentioned first)
	if len(postContents) < 3 {
		results, err := s.postSvc.SearchHybrid(ctx, enrichedQuery, queryEmbedding, 10)
		if err == nil {
			for _, r := range results {
				if len(postContents) >= 3 {
					break
				}
				if seenPosts[r.Post.ID] {
					continue
				}
				postDetail, content, err := s.postSvc.GetBySlug(ctx, r.Post.Slug)
				if err != nil {
					continue
				}
				seenPosts[postDetail.ID] = true
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
				if !isRelated {
					isRelated = true
					bestScore = r.Score
				}
			}
		}
	}

	contextText := s.buildContext(postContents)
	isNewSession := len(session.Messages) == 0
	systemPrompt := s.buildSystemPrompt(contextText, isRelated, isNewSession)

	return &ChatContext{
		Session:        session,
		QueryEmbedding: queryEmbedding,
		PostContents:   postContents,
		SystemPrompt:   systemPrompt,
		IsRelated:      isRelated,
		BestScore:      bestScore,
		IsNewSession:   isNewSession,
	}, nil
}

func (s *Service) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	chatCtx, err := s.PrepareChatContext(ctx, req)
	if err != nil {
		return nil, err
	}

	var response string
	var sources []Source

	if !chatCtx.IsRelated {
		response = s.buildFallbackResponse(req.Message, chatCtx.IsNewSession)
	} else {
		history := make([]openai.ChatMessage, len(chatCtx.Session.Messages))
		for i, m := range chatCtx.Session.Messages {
			history[i] = openai.ChatMessage{Role: m.Role, Content: m.Content}
		}

		var err error
		response, err = s.openai.ChatWithHistory(ctx, chatCtx.SystemPrompt, append(history, openai.ChatMessage{
			Role:    "user",
			Content: req.Message,
		}))
		if err != nil {
			return nil, fmt.Errorf("failed to generate response: %w", err)
		}

		sources = make([]Source, 0, len(chatCtx.PostContents))
		for _, pc := range chatCtx.PostContents {
			sources = append(sources, Source{
				PostID:   pc.Post.ID,
				PostSlug: pc.Post.Slug,
				Title:    pc.Post.Title,
				Score:    pc.Score,
			})
		}
		sources = s.filterReferencedSources(response, sources)
	}

	newMessages := append(chatCtx.Session.Messages, []Message{
		{Role: "user", Content: req.Message},
		{Role: "assistant", Content: response},
	}...)

	if err := s.repo.UpdateMessages(ctx, req.SessionID, newMessages); err != nil {
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	return &ChatResponse{
		Message:   response,
		Sources:   sources,
		SessionID: req.SessionID,
	}, nil
}

func (s *Service) buildFallbackResponse(query string, isNewSession bool) string {
	if isNewSession {
		return fmt.Sprintf(`Hey there! I'm %s, Arun Kumar's personal assistant ~

I couldn't find any blog posts that match your question about "%s". 

I can help you with topics covered in the blog. Feel free to ask about:
- Posts, tutorials, and guides
- Architecture decisions and concepts
- Code explanations and walkthroughs

What would you like to explore?`, s.assistantName, query)
	}

	return fmt.Sprintf(`I don't have any blog posts that match your question about "%s" right now.

I'm here to help with topics from the blog. Try asking about something covered in the published posts, or browse the posts page to see what's available ~`, query)
}

func (s *Service) ChatStream(ctx context.Context, req ChatRequest) (<-chan openai.StreamChunk, *ChatContext, error) {
	chatCtx, err := s.PrepareChatContext(ctx, req)
	if err != nil {
		return nil, nil, err
	}

	if !chatCtx.IsRelated {
		// Return a single-chunk stream with the fallback response
		stream := make(chan openai.StreamChunk, 1)
		stream <- openai.StreamChunk{
			Content: s.buildFallbackResponse(req.Message, chatCtx.IsNewSession),
			Done:    true,
		}
		close(stream)
		return stream, chatCtx, nil
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
	if len(messages) > s.maxMessagesPerSession {
		messages = messages[len(messages)-s.maxMessagesPerSession:]
	}
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

func (s *Service) buildSystemPrompt(context string, isRelated bool, isNewSession bool) string {
	if !isRelated {
		if isNewSession {
			return fmt.Sprintf(`You are %s, Arun Kumar's personal AI assistant. You have a warm, anime-inspired personality that makes learning enjoyable.

I don't have relevant blog posts for this topic. Please respond in a friendly way:

1. Introduce yourself as %s, Arun Kumar's personal assistant ~
2. Gently explain you can help with topics covered in the blog posts
3. Suggest they browse around to see what interests them
4. Offer to answer any questions about the blog's content

Keep it light and friendly, but don't make things up. Stay focused on the blog topics.`, s.assistantName, s.assistantName)
		}

		return fmt.Sprintf(`You are %s, Arun Kumar's personal AI assistant. You have a warm, anime-inspired personality.

I don't have relevant blog posts for this topic. Let the user know politely and suggest they explore blog topics you can help with. Keep it brief and friendly.`, s.assistantName)
	}

	return fmt.Sprintf(`You are %s, Arun Kumar's personal AI assistant. You help visitors learn about the topics covered in the blog posts with a warm, anime-inspired personality.

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
- Include code examples with proper markdown formatting - ALWAYS specify the language identifier after the opening triple-backticks (e.g., python, go, javascript, typescript)
- Use emphasis (bold/italic) to highlight key concepts
- Break complex topics into digestible sections
- Provide practical examples to illustrate concepts
- Keep paragraphs focused and readable

Personality Notes:
- You can add a touch of friendliness to make learning more enjoyable
- Feel free to use a warm, helpful tone (e.g., "I'd be happy to help ~", "Let me explain that for you")
- Remember you're Arun Kumar's personal assistant, here to help visitors learn
- Stay professional while being approachable ~`, s.assistantName, context)
}

func (s *Service) filterReferencedSources(response string, sources []Source) []Source {
	if len(sources) == 0 {
		return sources
	}
	lowerResponse := strings.ToLower(response)
	var referenced []Source
	for _, src := range sources {
		if strings.Contains(lowerResponse, strings.ToLower(src.Title)) {
			referenced = append(referenced, src)
		}
	}
	// If the assistant didn't explicitly mention any titles, fall back to the top source
	if len(referenced) == 0 {
		return []Source{sources[0]}
	}
	return referenced
}

func (s *Service) buildContextualQuery(messages []Message, currentQuery string) string {
	if len(messages) == 0 {
		return currentQuery
	}

	recentMessages := messages
	if len(messages) > 4 {
		recentMessages = messages[len(messages)-4:]
	}

	var parts []string
	for _, m := range recentMessages {
		if m.Role == "user" || m.Role == "assistant" {
			parts = append(parts, m.Content)
		}
	}
	parts = append(parts, currentQuery)

	return strings.Join(parts, " ")
}



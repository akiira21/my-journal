package openai

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type Client struct {
	client *openai.Client
}

func New(apiKey string) (*Client, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY is required")
	}

	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &Client{client: &client}, nil
}

func (c *Client) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	resp, err := c.client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Model: openai.EmbeddingModelTextEmbedding3Small,
		Input: openai.EmbeddingNewParamsInputUnion{
			OfArrayOfStrings: []string{text},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate embedding: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}

	embedding := make([]float32, len(resp.Data[0].Embedding))
	for i, v := range resp.Data[0].Embedding {
		embedding[i] = float32(v)
	}

	return embedding, nil
}

func (c *Client) GenerateEmbeddings(ctx context.Context, texts []string) ([][]float32, error) {
	resp, err := c.client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Model: openai.EmbeddingModelTextEmbedding3Small,
		Input: openai.EmbeddingNewParamsInputUnion{
			OfArrayOfStrings: texts,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate embeddings: %w", err)
	}

	embeddings := make([][]float32, len(resp.Data))
	for i, d := range resp.Data {
		embeddings[i] = make([]float32, len(d.Embedding))
		for j, v := range d.Embedding {
			embeddings[i][j] = float32(v)
		}
	}

	return embeddings, nil
}

func (c *Client) Chat(ctx context.Context, systemPrompt string, userMessage string) (string, error) {
	resp, err := c.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: openai.ChatModelGPT4o,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(systemPrompt),
			openai.UserMessage(userMessage),
		},
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate chat completion: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response generated")
	}

	return resp.Choices[0].Message.Content, nil
}

func (c *Client) ChatWithHistory(ctx context.Context, systemPrompt string, messages []ChatMessage) (string, error) {
	msgs := make([]openai.ChatCompletionMessageParamUnion, 0, len(messages)+1)
	msgs = append(msgs, openai.SystemMessage(systemPrompt))

	for _, m := range messages {
		switch m.Role {
		case "user":
			msgs = append(msgs, openai.UserMessage(m.Content))
		case "assistant":
			msgs = append(msgs, openai.AssistantMessage(m.Content))
		}
	}

	resp, err := c.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model:    openai.ChatModelGPT4o,
		Messages: msgs,
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate chat completion: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response generated")
	}

	return resp.Choices[0].Message.Content, nil
}

type ChatMessage struct {
	Role    string
	Content string
}

func GetSystemPrompt(ownerProfile string) string {
	return fmt.Sprintf(`You are an AI assistant for a personal blog and digital portfolio. You help visitors learn about the owner's work, projects, blog posts, and skills.

Owner Profile:
%s

Your capabilities:
1. Answer questions about the owner's blog posts using semantic search
2. Explain projects the owner has built
3. Discuss the owner's skills and learning journey
4. Share GitHub activity and LeetCode problem-solving progress
5. Provide context about technologies the owner uses

Guidelines:
- Be helpful and informative
- Provide accurate information based on the context provided
- If you don't know something, admit it honestly
- Keep responses concise but thorough
- Format code examples properly
- Cite sources when referencing blog posts or projects`, ownerProfile)
}

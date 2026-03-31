package post

import (
	"context"
	"strings"
	"time"

	"github.com/akiira21/my-journal-backend/internal/pkg/storage"
	"github.com/google/uuid"
)

type Service struct {
	repo    *Repository
	storage *storage.R2Client
}

func NewService(repo *Repository, storage *storage.R2Client) *Service {
	return &Service{
		repo:    repo,
		storage: storage,
	}
}

type CreatePostInput struct {
	Slug        string
	Title       string
	Description *string
	Content     string
	Categories  []string
	Tags        []string
	Featured    bool
	Publish     bool
}

type UpdatePostInput struct {
	Title       *string
	Description *string
	Content     *string
	Categories  []string
	Tags        []string
	Featured    *bool
	ReadTime    *int
	PublishedAt *time.Time
	IsArchived  *bool
}

func (s *Service) GetBySlug(ctx context.Context, slug string) (*Post, *string, error) {
	post, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, nil, err
	}

	content, err := s.GetContent(ctx, post.ContentURL)
	if err != nil {
		return post, nil, err
	}

	return post, content, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Post, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) List(ctx context.Context, limit, offset int) ([]PostSummary, int64, error) {
	posts, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.repo.GetTotalCount(ctx)
	if err != nil {
		return posts, 0, err
	}

	return posts, total, nil
}

func (s *Service) ListFeatured(ctx context.Context, limit int) ([]PostSummary, error) {
	return s.repo.ListFeatured(ctx, limit)
}

func (s *Service) ListByCategory(ctx context.Context, category string, limit, offset int) ([]PostSummary, error) {
	return s.repo.ListByCategory(ctx, category, limit, offset)
}

func (s *Service) ListByTag(ctx context.Context, tag string, limit, offset int) ([]PostSummary, error) {
	return s.repo.ListByTag(ctx, tag, limit, offset)
}

func (s *Service) Search(ctx context.Context, query string, limit, offset int) ([]PostSummary, error) {
	return s.repo.Search(ctx, query, limit, offset)
}

func (s *Service) Create(ctx context.Context, input CreatePostInput) (*Post, error) {
	contentURL := input.Slug + ".mdx"
	contentKey := "posts/" + contentURL

	err := s.storage.Upload(ctx, contentKey, strings.NewReader(input.Content), "text/markdown")
	if err != nil {
		return nil, err
	}

	readTime := calculateReadTime(input.Content)

	var publishedAt *time.Time
	if input.Publish {
		now := time.Now()
		publishedAt = &now
	}

	post, err := s.repo.Create(ctx,
		input.Slug,
		input.Title,
		contentURL,
		input.Description,
		input.Categories,
		input.Tags,
		input.Featured,
		readTime,
		publishedAt,
	)
	if err != nil {
		return nil, err
	}

	return post, nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, input UpdatePostInput) (*Post, error) {
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})

	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Description != nil {
		updates["description"] = input.Description
	}
	if input.Content != nil {
		readTime := calculateReadTime(*input.Content)
		updates["read_time_minutes"] = readTime
	}
	if input.Categories != nil {
		updates["categories"] = input.Categories
	}
	if input.Tags != nil {
		updates["tags"] = input.Tags
	}
	if input.Featured != nil {
		updates["featured"] = *input.Featured
	}
	if input.PublishedAt != nil {
		updates["published_at"] = input.PublishedAt
	}
	if input.IsArchived != nil {
		updates["is_archived"] = *input.IsArchived
	}

	return s.repo.Update(ctx, id, updates)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	post, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	err = s.storage.Delete(ctx, "posts/"+post.ContentURL)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

func (s *Service) Archive(ctx context.Context, id uuid.UUID) error {
	return s.repo.Archive(ctx, id)
}

func (s *Service) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return s.repo.IncrementViewCount(ctx, id)
}

func (s *Service) GetContent(ctx context.Context, contentURL string) (*string, error) {
	data, err := s.storage.Download(ctx, "posts/"+contentURL)
	if err != nil {
		return nil, err
	}

	content := string(data)
	return &content, nil
}

func (s *Service) CreateEmbedding(ctx context.Context, postID uuid.UUID, chunkIndex int, chunkText string, embedding []float32) error {
	return s.repo.CreateEmbedding(ctx, postID, chunkIndex, chunkText, embedding)
}

func (s *Service) GetEmbeddings(ctx context.Context, postID uuid.UUID) ([]Embedding, error) {
	return s.repo.GetEmbeddingsByPostID(ctx, postID)
}

func (s *Service) DeleteEmbeddings(ctx context.Context, postID uuid.UUID) error {
	return s.repo.DeleteEmbeddingsByPostID(ctx, postID)
}

func (s *Service) SearchSimilar(ctx context.Context, embedding []float32, limit int) ([]SearchResult, error) {
	return s.repo.SearchSimilar(ctx, embedding, limit)
}

func calculateReadTime(content string) *int {
	wordCount := len(strings.Fields(content))
	readTime := wordCount / 200
	if readTime < 1 {
		readTime = 1
	}
	return &readTime
}

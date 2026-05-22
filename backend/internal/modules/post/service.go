package post

import (
	"context"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/akiira21/my-journal-backend/internal/pkg/storage"
	"github.com/google/uuid"
)

var slugRegex = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func isValidSlug(slug string) bool {
	return slugRegex.MatchString(slug) && len(slug) <= 255
}

func sanitizeSlug(slug string) string {
	slug = strings.ToLower(strings.TrimSpace(slug))
	result := make([]rune, 0, len(slug))
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			result = append(result, r)
		} else if r == ' ' || r == '_' || r == '-' {
			result = append(result, '-')
		}
	}
	return strings.Trim(string(result), "-")
}

const (
	MaxContentSize = 10 * 1024 * 1024 // 10MB
	MaxTitleLength = 500
	MaxDescLength  = 2000
	MaxSlugLength  = 255
)

type CreatePostInput struct {
	Slug        string
	Title       string
	Description *string
	CoverURL    *string
	Content     string
	Categories  []string
	Tags        []string
	Featured    bool
	Publish     bool
}

type UpdatePostInput struct {
	Title       *string
	Description *string
	CoverURL    *string
	Content     *string
	Categories  []string
	Tags        []string
	Featured    *bool
	ReadTime    *int
	PublishedAt *time.Time
	IsArchived  *bool
}

type Service struct {
	repo    *Repository
	storage *storage.R2Client
	cache   *PostCache
}

func NewService(repo *Repository, storage *storage.R2Client, cache *PostCache) *Service {
	return &Service{
		repo:    repo,
		storage: storage,
		cache:   cache,
	}
}

func (s *Service) validateCreateInput(input *CreatePostInput) error {
	if !isValidSlug(input.Slug) {
		input.Slug = sanitizeSlug(input.Slug)
		if !isValidSlug(input.Slug) {
			return ErrInvalidSlug
		}
	}
	if len(input.Title) > MaxTitleLength {
		return ErrTitleTooLong
	}
	if input.Description != nil && len(*input.Description) > MaxDescLength {
		return ErrDescriptionTooLong
	}
	if len(input.Content) > MaxContentSize {
		return ErrContentTooLarge
	}
	return nil
}

func (s *Service) GetBySlug(ctx context.Context, slug string) (*Post, *string, error) {
	// Try cache for post metadata
	post, found, err := s.cache.GetPostMeta(ctx, slug)
	if err != nil {
		log.Printf("[PostService] cache GetPostMeta error for %s: %v", slug, err)
	}
	if !found {
		post, err = s.repo.GetBySlug(ctx, slug)
		if err != nil {
			return nil, nil, err
		}
		if cacheErr := s.cache.SetPostMeta(ctx, slug, post); cacheErr != nil {
			log.Printf("[PostService] cache SetPostMeta error for %s: %v", slug, cacheErr)
		}
	}

	content, err := s.GetContent(ctx, slug, post.ContentURL)
	if err != nil {
		log.Printf("[PostService] GetContent error for %s: %v", slug, err)
		return post, nil, err
	}

	return post, content, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Post, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) List(ctx context.Context, limit, offset int) ([]PostSummary, int64, error) {
	page := 1
	if limit > 0 {
		page = (offset / limit) + 1
	}

	// Try cache
	cached, found, err := s.cache.GetPostList(ctx, page, limit)
	if err != nil {
		log.Printf("[PostService] cache GetPostList error: %v", err)
	}
	if found {
		return cached.Posts, cached.Total, nil
	}

	posts, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.repo.GetTotalCount(ctx)
	if err != nil {
		return posts, 0, err
	}

	if cacheErr := s.cache.SetPostList(ctx, page, limit, posts, total); cacheErr != nil {
		log.Printf("[PostService] cache SetPostList error: %v", cacheErr)
	}

	return posts, total, nil
}

func (s *Service) ListFeatured(ctx context.Context, limit int) ([]PostSummary, error) {
	posts, found, err := s.cache.GetFeaturedPosts(ctx, limit)
	if err != nil {
		log.Printf("[PostService] cache GetFeaturedPosts error: %v", err)
	}
	if found {
		return posts, nil
	}

	posts, err = s.repo.ListFeatured(ctx, limit)
	if err != nil {
		return nil, err
	}

	if cacheErr := s.cache.SetFeaturedPosts(ctx, limit, posts); cacheErr != nil {
		log.Printf("[PostService] cache SetFeaturedPosts error: %v", cacheErr)
	}

	return posts, nil
}

func (s *Service) ListByCategory(ctx context.Context, category string, limit, offset int) ([]PostSummary, error) {
	page := 1
	if limit > 0 {
		page = (offset / limit) + 1
	}

	posts, found, err := s.cache.GetCategoryPosts(ctx, category, page, limit)
	if err != nil {
		log.Printf("[PostService] cache GetCategoryPosts error: %v", err)
	}
	if found {
		return posts, nil
	}

	posts, err = s.repo.ListByCategory(ctx, category, limit, offset)
	if err != nil {
		return nil, err
	}

	if cacheErr := s.cache.SetCategoryPosts(ctx, category, page, limit, posts); cacheErr != nil {
		log.Printf("[PostService] cache SetCategoryPosts error: %v", cacheErr)
	}

	return posts, nil
}

func (s *Service) ListByTag(ctx context.Context, tag string, limit, offset int) ([]PostSummary, error) {
	page := 1
	if limit > 0 {
		page = (offset / limit) + 1
	}

	posts, found, err := s.cache.GetTagPosts(ctx, tag, page, limit)
	if err != nil {
		log.Printf("[PostService] cache GetTagPosts error: %v", err)
	}
	if found {
		return posts, nil
	}

	posts, err = s.repo.ListByTag(ctx, tag, limit, offset)
	if err != nil {
		return nil, err
	}

	if cacheErr := s.cache.SetTagPosts(ctx, tag, page, limit, posts); cacheErr != nil {
		log.Printf("[PostService] cache SetTagPosts error: %v", cacheErr)
	}

	return posts, nil
}

func (s *Service) Search(ctx context.Context, query string, limit, offset int) ([]PostSummary, error) {
	posts, found, err := s.cache.GetSearchResults(ctx, query, limit, offset)
	if err != nil {
		log.Printf("[PostService] cache GetSearchResults error: %v", err)
	}
	if found {
		return posts, nil
	}

	posts, err = s.repo.Search(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}

	if cacheErr := s.cache.SetSearchResults(ctx, query, limit, offset, posts); cacheErr != nil {
		log.Printf("[PostService] cache SetSearchResults error: %v", cacheErr)
	}

	return posts, nil
}

func (s *Service) Create(ctx context.Context, input CreatePostInput) (*Post, error) {
	if err := s.validateCreateInput(&input); err != nil {
		return nil, err
	}

	contentKey := "posts/" + input.Slug + ".mdx"

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
		input.Slug+".mdx",
		input.Description,
		input.CoverURL,
		input.Categories,
		input.Tags,
		input.Featured,
		readTime,
		publishedAt,
	)
	if err != nil {
		return nil, err
	}

	// Invalidate list and search caches so new post appears
	if cacheErr := s.cache.InvalidateLists(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateLists error: %v", cacheErr)
	}
	if cacheErr := s.cache.InvalidateSearch(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateSearch error: %v", cacheErr)
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
	if input.CoverURL != nil {
		updates["cover_url"] = input.CoverURL
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

	updated, err := s.repo.Update(ctx, id, updates)
	if err != nil {
		return nil, err
	}

	// Invalidate post-specific and list caches
	if cacheErr := s.cache.InvalidatePost(ctx, updated.Slug); cacheErr != nil {
		log.Printf("[PostService] cache InvalidatePost error for %s: %v", updated.Slug, cacheErr)
	}
	if cacheErr := s.cache.InvalidateLists(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateLists error: %v", cacheErr)
	}
	if cacheErr := s.cache.InvalidateSearch(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateSearch error: %v", cacheErr)
	}

	return updated, nil
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

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate caches
	if cacheErr := s.cache.InvalidatePost(ctx, post.Slug); cacheErr != nil {
		log.Printf("[PostService] cache InvalidatePost error for %s: %v", post.Slug, cacheErr)
	}
	if cacheErr := s.cache.InvalidateLists(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateLists error: %v", cacheErr)
	}
	if cacheErr := s.cache.InvalidateSearch(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateSearch error: %v", cacheErr)
	}

	return nil
}

func (s *Service) Archive(ctx context.Context, id uuid.UUID) error {
	post, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.repo.Archive(ctx, id); err != nil {
		return err
	}

	// Invalidate caches
	if cacheErr := s.cache.InvalidatePost(ctx, post.Slug); cacheErr != nil {
		log.Printf("[PostService] cache InvalidatePost error for %s: %v", post.Slug, cacheErr)
	}
	if cacheErr := s.cache.InvalidateLists(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateLists error: %v", cacheErr)
	}
	if cacheErr := s.cache.InvalidateSearch(ctx); cacheErr != nil {
		log.Printf("[PostService] cache InvalidateSearch error: %v", cacheErr)
	}

	return nil
}

func (s *Service) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return s.repo.IncrementViewCount(ctx, id)
}

func (s *Service) GetContent(ctx context.Context, slug, contentURL string) (*string, error) {
	// Try cache for post content
	content, found, err := s.cache.GetPostContent(ctx, slug)
	if err != nil {
		log.Printf("[PostService] cache GetPostContent error for %s: %v", slug, err)
	}
	if found {
		return &content, nil
	}

	data, err := s.storage.Download(ctx, "posts/"+contentURL)
	if err != nil {
		return nil, err
	}

	content = string(data)
	if cacheErr := s.cache.SetPostContent(ctx, slug, content); cacheErr != nil {
		log.Printf("[PostService] cache SetPostContent error for %s: %v", slug, cacheErr)
	}
	return &content, nil
}

func (s *Service) CreateEmbedding(ctx context.Context, postID uuid.UUID, chunkIndex int, embedding []float32) error {
	return s.repo.CreateEmbedding(ctx, postID, chunkIndex, embedding)
}

func (s *Service) GetEmbeddings(ctx context.Context, postID uuid.UUID) ([]Embedding, error) {
	return s.repo.GetEmbeddingsByPostID(ctx, postID)
}

func (s *Service) DeleteEmbeddings(ctx context.Context, postID uuid.UUID) error {
	return s.repo.DeleteEmbeddingsByPostID(ctx, postID)
}

func (s *Service) SearchSimilar(ctx context.Context, embedding []float32, limit int) ([]SearchResult, error) {
	results, err := s.repo.SearchSimilar(ctx, embedding, limit)
	if err != nil {
		log.Printf("[PostService] SearchSimilar error: %v", err)
		return nil, err
	}
	return results, nil
}

func (s *Service) GetRelated(ctx context.Context, slug string, limit int) ([]SearchResult, error) {
	// Try cache for related posts
	results, found, err := s.cache.GetRelatedPosts(ctx, slug)
	if err != nil {
		log.Printf("[PostService] cache GetRelatedPosts error for %s: %v", slug, err)
	}
	if found {
		if len(results) > limit {
			return results[:limit], nil
		}
		return results, nil
	}

	post, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	embeddings, err := s.repo.GetEmbeddingsByPostID(ctx, post.ID)
	if err != nil || len(embeddings) == 0 {
		return nil, err
	}

	results, err = s.repo.SearchSimilar(ctx, embeddings[0].Embedding, limit+1)
	if err != nil {
		return nil, err
	}

	filtered := make([]SearchResult, 0, limit)
	for _, r := range results {
		if r.Post.ID != post.ID {
			filtered = append(filtered, r)
			if len(filtered) >= limit {
				break
			}
		}
	}

	if cacheErr := s.cache.SetRelatedPosts(ctx, slug, filtered); cacheErr != nil {
		log.Printf("[PostService] cache SetRelatedPosts error for %s: %v", slug, cacheErr)
	}

	return filtered, nil
}

func (s *Service) CreateEmbeddingJob(ctx context.Context, postID uuid.UUID, chunksTotal int) (*EmbeddingJob, error) {
	return s.repo.CreateEmbeddingJob(ctx, postID, chunksTotal)
}

func (s *Service) GetEmbeddingJobsByPostID(ctx context.Context, postID uuid.UUID) ([]EmbeddingJob, error) {
	return s.repo.GetEmbeddingJobsByPostID(ctx, postID)
}

func (s *Service) GetLatestEmbeddingJobForPost(ctx context.Context, postID uuid.UUID) (*EmbeddingJob, error) {
	return s.repo.GetLatestEmbeddingJobForPost(ctx, postID)
}

func calculateReadTime(content string) *int {
	wordCount := len(strings.Fields(content))
	readTime := wordCount / 200
	if readTime < 1 {
		readTime = 1
	}
	return &readTime
}

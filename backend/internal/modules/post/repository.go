package post

import (
	"context"
	"time"

	"github.com/akiira21/my-journal-backend/internal/modules/post/postdb"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pgvector/pgvector-go"
)

type Post struct {
	ID              uuid.UUID
	Slug            string
	Title           string
	Description     *string
	ContentURL      string
	CoverURL        *string
	Categories      []string
	Tags            []string
	Featured        bool
	ViewCount       int
	ReadTimeMinutes *int
	CreatedAt       time.Time
	UpdatedAt       time.Time
	PublishedAt     *time.Time
	IsArchived      bool
}

type PostSummary struct {
	ID              uuid.UUID
	Slug            string
	Title           string
	Description     *string
	CoverURL        *string
	Categories      []string
	Tags            []string
	Featured        bool
	ViewCount       int
	ReadTimeMinutes *int
	PublishedAt     *time.Time
}

type Embedding struct {
	ID         uuid.UUID
	PostID     uuid.UUID
	ChunkIndex int
	Embedding  []float32
}

type SearchResult struct {
	Post  PostSummary
	Score float64
}

type Repository struct {
	q *postdb.Queries
}

func NewRepository(db *database.DB) *Repository {
	return &Repository{
		q: postdb.New(db.Pool),
	}
}

func (r *Repository) GetBySlug(ctx context.Context, slug string) (*Post, error) {
	post, err := r.q.GetPostBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	return toPost(post), nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Post, error) {
	pgID := uuidToPgtype(id)
	post, err := r.q.GetPostByID(ctx, pgID)
	if err != nil {
		return nil, err
	}
	return toPost(post), nil
}

func (r *Repository) List(ctx context.Context, limit, offset int) ([]PostSummary, error) {
	posts, err := r.q.ListPosts(ctx, postdb.ListPostsParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		return nil, err
	}
	return toPostSummaries(posts), nil
}

func (r *Repository) ListFeatured(ctx context.Context, limit int) ([]PostSummary, error) {
	posts, err := r.q.ListFeaturedPosts(ctx, int32(limit))
	if err != nil {
		return nil, err
	}
	return toPostSummariesFromFeatured(posts), nil
}

func (r *Repository) ListByCategory(ctx context.Context, category string, limit, offset int) ([]PostSummary, error) {
	posts, err := r.q.ListPostsByCategory(ctx, postdb.ListPostsByCategoryParams{
		Categories: []string{category},
		Limit:      int32(limit),
		Offset:     int32(offset),
	})
	if err != nil {
		return nil, err
	}
	return toPostSummariesFromCategory(posts), nil
}

func (r *Repository) ListByTag(ctx context.Context, tag string, limit, offset int) ([]PostSummary, error) {
	posts, err := r.q.ListPostsByTag(ctx, postdb.ListPostsByTagParams{
		Tags:   []string{tag},
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		return nil, err
	}
	return toPostSummariesFromTag(posts), nil
}

func (r *Repository) Search(ctx context.Context, query string, limit, offset int) ([]PostSummary, error) {
	posts, err := r.q.SearchPosts(ctx, postdb.SearchPostsParams{
		Column1: pgtype.Text{String: query, Valid: true},
		Limit:   int32(limit),
		Offset:  int32(offset),
	})
	if err != nil {
		return nil, err
	}
	return toPostSummariesFromSearch(posts), nil
}

func (r *Repository) Create(ctx context.Context, slug, title, contentURL string, description, coverURL *string, categories, tags []string, featured bool, readTime *int, publishedAt *time.Time) (*Post, error) {
	params := postdb.CreatePostParams{
		Slug:       slug,
		Title:      title,
		ContentUrl: contentURL,
		Categories: categories,
		Tags:       tags,
	}

	if description != nil {
		params.Description = pgtype.Text{String: *description, Valid: true}
	}
	if coverURL != nil {
		params.CoverUrl = pgtype.Text{String: *coverURL, Valid: true}
	}
	if featured {
		params.Featured = pgtype.Bool{Bool: true, Valid: true}
	}
	if readTime != nil {
		params.ReadTimeMinutes = pgtype.Int4{Int32: int32(*readTime), Valid: true}
	}
	if publishedAt != nil {
		params.PublishedAt = pgtype.Timestamptz{Time: *publishedAt, Valid: true}
	}

	post, err := r.q.CreatePost(ctx, params)
	if err != nil {
		return nil, err
	}
	return toPost(post), nil
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, updates map[string]interface{}) (*Post, error) {
	pgID := uuidToPgtype(id)
	params := postdb.UpdatePostParams{ID: pgID}

	if v, ok := updates["title"].(string); ok {
		params.Title = pgtype.Text{String: v, Valid: true}
	}
	if v, ok := updates["description"].(*string); ok && v != nil {
		params.Description = pgtype.Text{String: *v, Valid: true}
	}
	if v, ok := updates["content_url"].(string); ok {
		params.ContentUrl = pgtype.Text{String: v, Valid: true}
	}
	if v, ok := updates["cover_url"].(*string); ok && v != nil {
		params.CoverUrl = pgtype.Text{String: *v, Valid: true}
	}
	if v, ok := updates["categories"].([]string); ok {
		params.Categories = v
	}
	if v, ok := updates["tags"].([]string); ok {
		params.Tags = v
	}
	if v, ok := updates["featured"].(bool); ok {
		params.Featured = pgtype.Bool{Bool: v, Valid: true}
	}
	if v, ok := updates["read_time_minutes"].(*int); ok && v != nil {
		params.ReadTimeMinutes = pgtype.Int4{Int32: int32(*v), Valid: true}
	}
	if v, ok := updates["published_at"].(*time.Time); ok && v != nil {
		params.PublishedAt = pgtype.Timestamptz{Time: *v, Valid: true}
	}
	if v, ok := updates["is_archived"].(bool); ok {
		params.IsArchived = pgtype.Bool{Bool: v, Valid: true}
	}

	updated, err := r.q.UpdatePost(ctx, params)
	if err != nil {
		return nil, err
	}
	return toPost(updated), nil
}

func (r *Repository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return r.q.IncrementViewCount(ctx, uuidToPgtype(id))
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeletePost(ctx, uuidToPgtype(id))
}

func (r *Repository) Archive(ctx context.Context, id uuid.UUID) error {
	return r.q.ArchivePost(ctx, uuidToPgtype(id))
}

func (r *Repository) GetTotalCount(ctx context.Context) (int64, error) {
	count, err := r.q.GetTotalPostCount(ctx)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *Repository) CreateEmbedding(ctx context.Context, postID uuid.UUID, chunkIndex int, embedding []float32) error {
	_, err := r.q.CreateEmbedding(ctx, postdb.CreateEmbeddingParams{
		PostID:     uuidToPgtype(postID),
		ChunkIndex: int32(chunkIndex),
		Embedding:  pgvector.NewVector(embedding),
	})
	return err
}

func (r *Repository) GetEmbeddingsByPostID(ctx context.Context, postID uuid.UUID) ([]Embedding, error) {
	embeddings, err := r.q.GetEmbeddingsByPostID(ctx, uuidToPgtype(postID))
	if err != nil {
		return nil, err
	}
	result := make([]Embedding, len(embeddings))
	for i, e := range embeddings {
		result[i] = Embedding{
			ID:         pgtypeToUUID(e.ID),
			PostID:     pgtypeToUUID(e.PostID),
			ChunkIndex: int(e.ChunkIndex),
			Embedding:  e.Embedding.Slice(),
		}
	}
	return result, nil
}

func (r *Repository) DeleteEmbeddingsByPostID(ctx context.Context, postID uuid.UUID) error {
	return r.q.DeleteEmbeddingsByPostID(ctx, uuidToPgtype(postID))
}

func (r *Repository) SearchSimilar(ctx context.Context, embedding []float32, limit int) ([]SearchResult, error) {
	vector := pgvector.NewVector(embedding)
	results, err := r.q.SearchSimilarEmbeddings(ctx, postdb.SearchSimilarEmbeddingsParams{
		Embedding: vector,
		Limit:     int32(limit),
	})
	if err != nil {
		return nil, err
	}
	return toSearchResults(results), nil
}

func toPost(p postdb.Post) *Post {
	return &Post{
		ID:              pgtypeToUUID(p.ID),
		Slug:            p.Slug,
		Title:           p.Title,
		Description:     pgtypeTextToPtr(p.Description),
		ContentURL:      p.ContentUrl,
		CoverURL:        pgtypeTextToPtr(p.CoverUrl),
		Categories:      p.Categories,
		Tags:            p.Tags,
		Featured:        p.Featured.Bool,
		ViewCount:       int(p.ViewCount.Int32),
		ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
		CreatedAt:       p.CreatedAt.Time,
		UpdatedAt:       p.UpdatedAt.Time,
		PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		IsArchived:      p.IsArchived.Bool,
	}
}

func toPostSummaries(posts []postdb.ListPostsRow) []PostSummary {
	result := make([]PostSummary, len(posts))
	for i, p := range posts {
		result[i] = PostSummary{
			ID:              pgtypeToUUID(p.ID),
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     pgtypeTextToPtr(p.Description),
			CoverURL:        pgtypeTextToPtr(p.CoverUrl),
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured.Bool,
			ViewCount:       int(p.ViewCount.Int32),
			ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
			PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		}
	}
	return result
}

func toPostSummariesFromFeatured(posts []postdb.ListFeaturedPostsRow) []PostSummary {
	result := make([]PostSummary, len(posts))
	for i, p := range posts {
		result[i] = PostSummary{
			ID:              pgtypeToUUID(p.ID),
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     pgtypeTextToPtr(p.Description),
			CoverURL:        pgtypeTextToPtr(p.CoverUrl),
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured.Bool,
			ViewCount:       int(p.ViewCount.Int32),
			ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
			PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		}
	}
	return result
}

func toPostSummariesFromCategory(posts []postdb.ListPostsByCategoryRow) []PostSummary {
	result := make([]PostSummary, len(posts))
	for i, p := range posts {
		result[i] = PostSummary{
			ID:              pgtypeToUUID(p.ID),
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     pgtypeTextToPtr(p.Description),
			CoverURL:        pgtypeTextToPtr(p.CoverUrl),
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured.Bool,
			ViewCount:       int(p.ViewCount.Int32),
			ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
			PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		}
	}
	return result
}

func toPostSummariesFromTag(posts []postdb.ListPostsByTagRow) []PostSummary {
	result := make([]PostSummary, len(posts))
	for i, p := range posts {
		result[i] = PostSummary{
			ID:              pgtypeToUUID(p.ID),
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     pgtypeTextToPtr(p.Description),
			CoverURL:        pgtypeTextToPtr(p.CoverUrl),
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured.Bool,
			ViewCount:       int(p.ViewCount.Int32),
			ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
			PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		}
	}
	return result
}

func toPostSummariesFromSearch(posts []postdb.SearchPostsRow) []PostSummary {
	result := make([]PostSummary, len(posts))
	for i, p := range posts {
		result[i] = PostSummary{
			ID:              pgtypeToUUID(p.ID),
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     pgtypeTextToPtr(p.Description),
			CoverURL:        pgtypeTextToPtr(p.CoverUrl),
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured.Bool,
			ViewCount:       int(p.ViewCount.Int32),
			ReadTimeMinutes: pgtypeInt4ToPtr(p.ReadTimeMinutes),
			PublishedAt:     pgtypeTimestamptzToPtr(p.PublishedAt),
		}
	}
	return result
}

func toSearchResults(results []postdb.SearchSimilarEmbeddingsRow) []SearchResult {
	searchResults := make([]SearchResult, len(results))
	for i, r := range results {
		searchResults[i] = SearchResult{
			Post: PostSummary{
				ID:          pgtypeToUUID(r.ID),
				Slug:        r.Slug,
				Title:       r.Title,
				Description: pgtypeTextToPtr(r.Description),
			},
			Score: float64(r.Similarity),
		}
	}
	return searchResults
}

func uuidToPgtype(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: id, Valid: true}
}

func pgtypeToUUID(id pgtype.UUID) uuid.UUID {
	return id.Bytes
}

func pgtypeTextToPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func pgtypeInt4ToPtr(i pgtype.Int4) *int {
	if !i.Valid {
		return nil
	}
	v := int(i.Int32)
	return &v
}

func pgtypeTimestamptzToPtr(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

type EmbeddingJobStatus string

const (
	JobStatusPending    EmbeddingJobStatus = "pending"
	JobStatusProcessing EmbeddingJobStatus = "processing"
	JobStatusCompleted  EmbeddingJobStatus = "completed"
	JobStatusFailed     EmbeddingJobStatus = "failed"
)

type EmbeddingJob struct {
	ID              uuid.UUID
	PostID          uuid.UUID
	Status          EmbeddingJobStatus
	Error           *string
	ChunksTotal     int
	ChunksCompleted int
	CreatedAt       time.Time
	StartedAt       *time.Time
	CompletedAt     *time.Time
}

func (r *Repository) CreateEmbeddingJob(ctx context.Context, postID uuid.UUID, chunksTotal int) (*EmbeddingJob, error) {
	job, err := r.q.CreateEmbeddingJob(ctx, postdb.CreateEmbeddingJobParams{
		PostID:      uuidToPgtype(postID),
		ChunksTotal: pgtype.Int4{Int32: int32(chunksTotal), Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return toEmbeddingJob(job), nil
}

func (r *Repository) GetEmbeddingJobByID(ctx context.Context, id uuid.UUID) (*EmbeddingJob, error) {
	job, err := r.q.GetEmbeddingJobByID(ctx, uuidToPgtype(id))
	if err != nil {
		return nil, err
	}
	return toEmbeddingJob(job), nil
}

func (r *Repository) GetEmbeddingJobsByPostID(ctx context.Context, postID uuid.UUID) ([]EmbeddingJob, error) {
	jobs, err := r.q.GetEmbeddingJobsByPostID(ctx, uuidToPgtype(postID))
	if err != nil {
		return nil, err
	}
	result := make([]EmbeddingJob, len(jobs))
	for i, j := range jobs {
		result[i] = *toEmbeddingJob(j)
	}
	return result, nil
}

func (r *Repository) GetLatestEmbeddingJobForPost(ctx context.Context, postID uuid.UUID) (*EmbeddingJob, error) {
	job, err := r.q.GetLatestEmbeddingJobForPost(ctx, uuidToPgtype(postID))
	if err != nil {
		return nil, err
	}
	return toEmbeddingJob(job), nil
}

func (r *Repository) UpdateEmbeddingJobStatus(ctx context.Context, id uuid.UUID, status EmbeddingJobStatus, errMsg *string) error {
	var errText pgtype.Text
	if errMsg != nil {
		errText = pgtype.Text{String: *errMsg, Valid: true}
	}
	return r.q.UpdateEmbeddingJobStatus(ctx, postdb.UpdateEmbeddingJobStatusParams{
		ID:      uuidToPgtype(id),
		Column2: postdb.JobStatus(status),
		Error:   errText,
	})
}

func (r *Repository) UpdateEmbeddingJobProgress(ctx context.Context, id uuid.UUID, chunksCompleted int) error {
	return r.q.UpdateEmbeddingJobProgress(ctx, postdb.UpdateEmbeddingJobProgressParams{
		ID:              uuidToPgtype(id),
		ChunksCompleted: pgtype.Int4{Int32: int32(chunksCompleted), Valid: true},
	})
}

func toEmbeddingJob(j postdb.EmbeddingJob) *EmbeddingJob {
	return &EmbeddingJob{
		ID:              pgtypeToUUID(j.ID),
		PostID:          pgtypeToUUID(j.PostID),
		Status:          EmbeddingJobStatus(j.Status),
		Error:           pgtypeTextToPtr(j.Error),
		ChunksTotal:     int(j.ChunksTotal.Int32),
		ChunksCompleted: int(j.ChunksCompleted.Int32),
		CreatedAt:       j.CreatedAt.Time,
		StartedAt:       pgtypeTimestamptzToPtr(j.StartedAt),
		CompletedAt:     pgtypeTimestamptzToPtr(j.CompletedAt),
	}
}

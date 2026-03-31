package post

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type postResponse struct {
	ID              uuid.UUID `json:"id"`
	Slug            string    `json:"slug"`
	Title           string    `json:"title"`
	Description     *string   `json:"description"`
	Content         *string   `json:"content,omitempty"`
	ContentURL      string    `json:"content_url"`
	Categories      []string  `json:"categories"`
	Tags            []string  `json:"tags"`
	Featured        bool      `json:"featured"`
	ViewCount       int       `json:"view_count"`
	ReadTimeMinutes *int      `json:"read_time_minutes"`
	CreatedAt       string    `json:"created_at"`
	UpdatedAt       string    `json:"updated_at"`
	PublishedAt     *string   `json:"published_at"`
}

type postSummaryResponse struct {
	ID              uuid.UUID `json:"id"`
	Slug            string    `json:"slug"`
	Title           string    `json:"title"`
	Description     *string   `json:"description"`
	Categories      []string  `json:"categories"`
	Tags            []string  `json:"tags"`
	Featured        bool      `json:"featured"`
	ViewCount       int       `json:"view_count"`
	ReadTimeMinutes *int      `json:"read_time_minutes"`
	PublishedAt     *string   `json:"published_at"`
}

type listResponse struct {
	Posts    []postSummaryResponse `json:"posts"`
	Total    int64                 `json:"total"`
	Page     int                   `json:"page"`
	PageSize int                   `json:"page_size"`
}

type createPostRequest struct {
	Slug        string   `json:"slug" binding:"required"`
	Title       string   `json:"title" binding:"required"`
	Description *string  `json:"description"`
	Content     string   `json:"content" binding:"required"`
	Categories  []string `json:"categories"`
	Tags        []string `json:"tags"`
	Featured    bool     `json:"featured"`
	Publish     bool     `json:"publish"`
}

type updatePostRequest struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Content     *string  `json:"content"`
	Categories  []string `json:"categories"`
	Tags        []string `json:"tags"`
	Featured    *bool    `json:"featured"`
	IsArchived  *bool    `json:"is_archived"`
}

type searchRequest struct {
	Query  string `form:"q" binding:"required"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

func (h *Handler) GetPost(c *gin.Context) {
	slug := c.Param("slug")
	includeContent := c.Query("content") == "true"

	post, content, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	response := toPostResponse(post)
	if includeContent && content != nil {
		response.Content = content
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) ListPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if pageSize > 50 {
		pageSize = 50
	}

	offset := (page - 1) * pageSize

	posts, total, err := h.service.List(c.Request.Context(), pageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list posts"})
		return
	}

	c.JSON(http.StatusOK, listResponse{
		Posts:    toPostSummariesResponse(posts),
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func (h *Handler) ListFeatured(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
	if limit > 10 {
		limit = 10
	}

	posts, err := h.service.ListFeatured(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list featured posts"})
		return
	}

	c.JSON(http.StatusOK, toPostSummariesResponse(posts))
}

func (h *Handler) ListByCategory(c *gin.Context) {
	category := c.Param("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if pageSize > 50 {
		pageSize = 50
	}

	offset := (page - 1) * pageSize

	posts, err := h.service.ListByCategory(c.Request.Context(), category, pageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list posts by category"})
		return
	}

	c.JSON(http.StatusOK, toPostSummariesResponse(posts))
}

func (h *Handler) ListByTag(c *gin.Context) {
	tag := c.Param("tag")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if pageSize > 50 {
		pageSize = 50
	}

	offset := (page - 1) * pageSize

	posts, err := h.service.ListByTag(c.Request.Context(), tag, pageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list posts by tag"})
		return
	}

	c.JSON(http.StatusOK, toPostSummariesResponse(posts))
}

func (h *Handler) Search(c *gin.Context) {
	var req searchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid search query"})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}
	if req.Limit > 50 {
		req.Limit = 50
	}

	posts, err := h.service.Search(c.Request.Context(), req.Query, req.Limit, req.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}

	c.JSON(http.StatusOK, toPostSummariesResponse(posts))
}

func (h *Handler) CreatePost(c *gin.Context) {
	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.service.Create(c.Request.Context(), CreatePostInput{
		Slug:        req.Slug,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Categories:  req.Categories,
		Tags:        req.Tags,
		Featured:    req.Featured,
		Publish:     req.Publish,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, toPostResponse(post))
}

func (h *Handler) UpdatePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	var req updatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.service.Update(c.Request.Context(), id, UpdatePostInput{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Categories:  req.Categories,
		Tags:        req.Tags,
		Featured:    req.Featured,
		IsArchived:  req.IsArchived,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, toPostResponse(post))
}

func (h *Handler) DeletePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) ArchivePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := h.service.Archive(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to archive post"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) IncrementViewCount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := h.service.IncrementViewCount(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to increment view count"})
		return
	}

	c.Status(http.StatusNoContent)
}

func toPostResponse(p *Post) postResponse {
	return postResponse{
		ID:              p.ID,
		Slug:            p.Slug,
		Title:           p.Title,
		Description:     p.Description,
		ContentURL:      p.ContentURL,
		Categories:      p.Categories,
		Tags:            p.Tags,
		Featured:        p.Featured,
		ViewCount:       p.ViewCount,
		ReadTimeMinutes: p.ReadTimeMinutes,
		CreatedAt:       p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       p.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		PublishedAt:     formatTime(p.PublishedAt),
	}
}

func toPostSummariesResponse(posts []PostSummary) []postSummaryResponse {
	result := make([]postSummaryResponse, len(posts))
	for i, p := range posts {
		result[i] = postSummaryResponse{
			ID:              p.ID,
			Slug:            p.Slug,
			Title:           p.Title,
			Description:     p.Description,
			Categories:      p.Categories,
			Tags:            p.Tags,
			Featured:        p.Featured,
			ViewCount:       p.ViewCount,
			ReadTimeMinutes: p.ReadTimeMinutes,
			PublishedAt:     formatTime(p.PublishedAt),
		}
	}
	return result
}

func formatTime(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formatted := t.Format("2006-01-02T15:04:05Z07:00")
	return &formatted
}

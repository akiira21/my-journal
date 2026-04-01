package post

import (
	"net/http"
	"strings"

	"github.com/akiira21/my-journal-backend/internal/pkg/frontmatter"
	"github.com/akiira21/my-journal-backend/internal/pkg/queue"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const maxChunkSize = 2000

type AdminHandler struct {
	service *Service
	queue   *queue.Queue
}

func NewAdminHandler(service *Service, queue *queue.Queue) *AdminHandler {
	return &AdminHandler{
		service: service,
		queue:   queue,
	}
}

func estimateChunks(content string) int {
	sections := strings.Split(content, "\n## ")
	total := 0
	for _, section := range sections {
		if len(section) <= maxChunkSize {
			total++
		} else {
			paragraphs := strings.Split(section, "\n\n")
			current := 0
			for _, p := range paragraphs {
				if current+len(p) > maxChunkSize && current > 0 {
					total++
					current = len(p)
				} else {
					current += len(p) + 2
				}
			}
			if current > 0 {
				total++
			}
		}
	}
	if total == 0 {
		return 1
	}
	return total
}

type createWithMDXRequest struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description"`
	Content     string   `json:"content" binding:"required"`
	Categories  []string `json:"categories"`
	Tags        []string `json:"tags"`
	Featured    bool     `json:"featured"`
	Publish     bool     `json:"publish"`
}

type createFromMDXRequest struct {
	Content string `json:"content" binding:"required"`
	Publish bool   `json:"publish"`
}

func (h *AdminHandler) CreatePost(c *gin.Context) {
	var req createWithMDXRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	desc := req.Description
	post, err := h.service.Create(c.Request.Context(), CreatePostInput{
		Slug:        req.Slug,
		Title:       req.Title,
		Description: &desc,
		Content:     req.Content,
		Categories:  req.Categories,
		Tags:        req.Tags,
		Featured:    req.Featured,
		Publish:     req.Publish,
	})
	if err != nil {
		if err == ErrInvalidSlug {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slug format"})
			return
		}
		if err == ErrTitleTooLong {
			c.JSON(http.StatusBadRequest, gin.H{"error": "title exceeds maximum length"})
			return
		}
		if err == ErrDescriptionTooLong {
			c.JSON(http.StatusBadRequest, gin.H{"error": "description exceeds maximum length"})
			return
		}
		if err == ErrContentTooLarge {
			c.JSON(http.StatusBadRequest, gin.H{"error": "content exceeds maximum size"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	chunks := estimateChunks(req.Content)
	job, err := h.service.CreateEmbeddingJob(c.Request.Context(), post.ID, chunks)
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{
			"post":    toPostResponse(post),
			"warning": "post created but failed to queue embedding job: " + err.Error(),
		})
		return
	}

	if h.queue != nil {
		if err := h.queue.PushEmbeddingJob(c.Request.Context(), queue.EmbeddingJob{
			JobID:       job.ID.String(),
			PostID:      post.ID.String(),
			PostSlug:    post.Slug,
			Content:     req.Content,
			Title:       req.Title,
			Description: desc,
		}); err != nil {
			c.JSON(http.StatusCreated, gin.H{
				"post":    toPostResponse(post),
				"warning": "post created but failed to queue embedding job",
			})
			return
		}
	}

	c.JSON(http.StatusCreated, toPostResponse(post))
}

func (h *AdminHandler) CreateFromMDX(c *gin.Context) {
	var req createFromMDXRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsed, err := frontmatter.Parse(req.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse frontmatter: " + err.Error()})
		return
	}

	post, err := h.service.Create(c.Request.Context(), CreatePostInput{
		Slug:        parsed.Slug,
		Title:       parsed.Title,
		Description: &parsed.Description,
		Content:     parsed.Content,
		Categories:  parsed.Categories,
		Tags:        parsed.Tags,
		Featured:    parsed.Featured,
		Publish:     req.Publish && parsed.PublishedAt != nil,
	})
	if err != nil {
		if err == ErrInvalidSlug {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slug format"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	chunks := estimateChunks(parsed.Content)
	job, err := h.service.CreateEmbeddingJob(c.Request.Context(), post.ID, chunks)
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{
			"post":    toPostResponse(post),
			"warning": "post created but failed to create embedding job: " + err.Error(),
		})
		return
	}

	if h.queue != nil {
		if err := h.queue.PushEmbeddingJob(c.Request.Context(), queue.EmbeddingJob{
			JobID:       job.ID.String(),
			PostID:      post.ID.String(),
			PostSlug:    post.Slug,
			Content:     parsed.Content,
			Title:       parsed.Title,
			Description: parsed.Description,
		}); err != nil {
			c.JSON(http.StatusCreated, gin.H{
				"post":    toPostResponse(post),
				"warning": "post created but failed to queue embedding job",
			})
			return
		}
	}

	c.JSON(http.StatusCreated, toPostResponse(post))
}

func (h *AdminHandler) UpdatePost(c *gin.Context) {
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

func (h *AdminHandler) DeletePost(c *gin.Context) {
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

func (h *AdminHandler) Repost(c *gin.Context) {
	slug := c.Param("slug")

	post, _, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	var req createFromMDXRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsed, err := frontmatter.Parse(req.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse frontmatter: " + err.Error()})
		return
	}

	updated, err := h.service.Update(c.Request.Context(), post.ID, UpdatePostInput{
		Title:       &parsed.Title,
		Description: &parsed.Description,
		Content:     &parsed.Content,
		Categories:  parsed.Categories,
		Tags:        parsed.Tags,
		Featured:    &parsed.Featured,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	chunks := estimateChunks(parsed.Content)
	job, err := h.service.CreateEmbeddingJob(c.Request.Context(), updated.ID, chunks)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"post":    toPostResponse(updated),
			"warning": "post updated but failed to create embedding job: " + err.Error(),
		})
		return
	}

	if h.queue != nil {
		if err := h.queue.PushEmbeddingJob(c.Request.Context(), queue.EmbeddingJob{
			JobID:       job.ID.String(),
			PostID:      updated.ID.String(),
			PostSlug:    updated.Slug,
			Content:     parsed.Content,
			Title:       parsed.Title,
			Description: parsed.Description,
		}); err != nil {
			c.JSON(http.StatusOK, gin.H{
				"post":    toPostResponse(updated),
				"warning": "post updated but failed to queue embedding job",
			})
			return
		}
	}

	c.JSON(http.StatusOK, toPostResponse(updated))
}

package jobs

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/modules/post/postdb"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	"github.com/akiira21/my-journal-backend/internal/pkg/queue"
	redisPkg "github.com/akiira21/my-journal-backend/internal/pkg/redis"
)

const (
	maxChunkSize = 2000
	pollInterval = 5 * time.Second
)

type EmbeddingWorker struct {
	queue    *queue.Queue
	postRepo *post.Repository
	openai   *openai.Client
	stopChan chan struct{}
	running  bool
}

func NewEmbeddingWorker(redis *redisPkg.Client, postRepo *post.Repository, openaiClient *openai.Client) *EmbeddingWorker {
	return &EmbeddingWorker{
		queue:    queue.NewQueue(redis),
		postRepo: postRepo,
		openai:   openaiClient,
		stopChan: make(chan struct{}),
	}
}

func (w *EmbeddingWorker) Start(ctx context.Context) {
	if w.running {
		return
	}
	w.running = true

	log.Println("Starting embedding worker...")

	go func() {
		ticker := time.NewTicker(pollInterval)
		defer ticker.Stop()

		for {
			select {
			case <-w.stopChan:
				log.Println("Embedding worker stopped")
				return
			case <-ctx.Done():
				log.Println("Embedding worker stopped (context cancelled)")
				return
			case <-ticker.C:
				w.processJobs(ctx)
			}
		}
	}()
}

func (w *EmbeddingWorker) Stop() {
	if !w.running {
		return
	}
	w.running = false
	close(w.stopChan)
}

func (w *EmbeddingWorker) processJobs(ctx context.Context) {
	for {
		job, err := w.queue.PopEmbeddingJob(ctx)
		if err != nil {
			return
		}

		log.Printf("Processing embedding job %s for post: %s", job.JobID, job.PostSlug)

		if err := w.processEmbeddingJob(ctx, job); err != nil {
			log.Printf("Error processing embedding job %s: %v", job.JobID, err)
			continue
		}

		log.Printf("Successfully processed embedding job %s for post: %s", job.JobID, job.PostSlug)
	}
}

func (w *EmbeddingWorker) processEmbeddingJob(ctx context.Context, job *queue.EmbeddingJob) error {
	jobID, err := uuid.Parse(job.JobID)
	if err != nil {
		return fmt.Errorf("invalid job ID: %w", err)
	}

	postID, err := uuid.Parse(job.PostID)
	if err != nil {
		return fmt.Errorf("invalid post ID: %w", err)
	}

	if err := w.postRepo.UpdateEmbeddingJobStatus(ctx, jobID, post.JobStatusProcessing, nil); err != nil {
		log.Printf("Warning: failed to update job status to processing: %v", err)
	}

	chunks := w.chunkContent(job.Content, job.Title, job.Description)

	chunksTotal := len(chunks)
	if chunksTotal == 0 {
		chunksTotal = 1
	}

	if err := w.postRepo.DeleteEmbeddingsByPostID(ctx, postID); err != nil {
		errMsg := "failed to delete existing embeddings"
		w.postRepo.UpdateEmbeddingJobStatus(ctx, jobID, post.JobStatusFailed, &errMsg)
		return fmt.Errorf("%s: %w", errMsg, err)
	}

	var lastErr error
	for i, chunk := range chunks {
		embedding, err := w.openai.GenerateEmbedding(ctx, chunk)
		if err != nil {
			log.Printf("Error generating embedding for chunk %d: %v", i, err)
			lastErr = err
			continue
		}

		if err := w.postRepo.CreateEmbedding(ctx, postID, i, embedding); err != nil {
			log.Printf("Error saving embedding for chunk %d: %v", i, err)
			lastErr = err
			continue
		}

		if err := w.postRepo.UpdateEmbeddingJobProgress(ctx, jobID, i+1); err != nil {
			log.Printf("Warning: failed to update job progress: %v", err)
		}
	}

	if lastErr != nil {
		errMsg := lastErr.Error()
		w.postRepo.UpdateEmbeddingJobStatus(ctx, jobID, post.JobStatusFailed, &errMsg)
		return fmt.Errorf("embedding generation failed: %w", lastErr)
	}

	return w.postRepo.UpdateEmbeddingJobStatus(ctx, jobID, post.JobStatusCompleted, nil)
}

func (w *EmbeddingWorker) chunkContent(content, title, description string) []string {
	var chunks []string

	var sb strings.Builder
	if title != "" {
		sb.WriteString("# ")
		sb.WriteString(title)
		sb.WriteString("\n\n")
	}
	if description != "" {
		sb.WriteString(description)
		sb.WriteString("\n\n")
	}
	sb.WriteString(content)

	fullContent := sb.String()

	sections := strings.Split(fullContent, "\n## ")

	for i, section := range sections {
		if i > 0 {
			section = "## " + section
		}

		if len(section) <= maxChunkSize {
			chunks = append(chunks, strings.TrimSpace(section))
		} else {
			paraChunks := w.chunkByParagraph(section)
			chunks = append(chunks, paraChunks...)
		}
	}

	return chunks
}

func (w *EmbeddingWorker) chunkByParagraph(content string) []string {
	var chunks []string

	paragraphs := strings.Split(content, "\n\n")

	var currentChunk strings.Builder
	for _, para := range paragraphs {
		if currentChunk.Len()+len(para) > maxChunkSize && currentChunk.Len() > 0 {
			chunks = append(chunks, strings.TrimSpace(currentChunk.String()))
			currentChunk.Reset()
		}
		currentChunk.WriteString(para)
		currentChunk.WriteString("\n\n")
	}

	if currentChunk.Len() > 0 {
		chunks = append(chunks, strings.TrimSpace(currentChunk.String()))
	}

	return chunks
}

func JobStatusFromDB(s postdb.JobStatus) post.EmbeddingJobStatus {
	return post.EmbeddingJobStatus(s)
}

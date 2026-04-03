package queue

import (
	"context"
	"encoding/json"
	"fmt"

	redis "github.com/akiira21/my-journal-backend/internal/pkg/redis"
)

const (
	EmbeddingQueueKey = "embedding_jobs"
)

type EmbeddingJob struct {
	JobID       string `json:"job_id"`
	PostID      string `json:"post_id"`
	PostSlug    string `json:"post_slug"`
	Content     string `json:"content"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Queue struct {
	client *redis.Client
}

func NewQueue(client *redis.Client) *Queue {
	return &Queue{client: client}
}

func (q *Queue) PushEmbeddingJob(ctx context.Context, job EmbeddingJob) error {
	data, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal embedding job: %w", err)
	}

	if err := q.client.LPush(ctx, EmbeddingQueueKey, data).Err(); err != nil {
		return fmt.Errorf("failed to push embedding job to queue: %w", err)
	}

	return nil
}

func (q *Queue) PopEmbeddingJob(ctx context.Context) (*EmbeddingJob, error) {
	result, err := q.client.RPop(ctx, EmbeddingQueueKey).Result()
	if err != nil {
		return nil, err
	}

	var job EmbeddingJob
	if err := json.Unmarshal([]byte(result), &job); err != nil {
		return nil, fmt.Errorf("failed to unmarshal embedding job: %w", err)
	}

	return &job, nil
}

func (q *Queue) GetQueueLength(ctx context.Context) (int64, error) {
	length, err := q.client.LLen(ctx, EmbeddingQueueKey).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get queue length: %w", err)
	}
	return length, nil
}

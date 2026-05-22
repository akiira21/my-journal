package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/akiira21/my-journal-backend/internal/pkg/redis"
	goredis "github.com/redis/go-redis/v9"
)

type Cache struct {
	client *redis.Client
	prefix string
}

func New(client *redis.Client, prefix string) *Cache {
	return &Cache{
		client: client,
		prefix: prefix,
	}
}

func (c *Cache) key(k string) string {
	return c.prefix + ":" + k
}

func (c *Cache) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	data, err := c.client.Get(ctx, c.key(key)).Bytes()
	if err != nil {
		if err == goredis.Nil {
			return false, nil
		}
		return false, fmt.Errorf("cache get failed: %w", err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return false, fmt.Errorf("cache unmarshal failed: %w", err)
	}

	return true, nil
}

func (c *Cache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("cache marshal failed: %w", err)
	}

	if err := c.client.Set(ctx, c.key(key), data, ttl).Err(); err != nil {
		return fmt.Errorf("cache set failed: %w", err)
	}

	return nil
}

func (c *Cache) Delete(ctx context.Context, key string) error {
	if err := c.client.Del(ctx, c.key(key)).Err(); err != nil {
		return fmt.Errorf("cache delete failed: %w", err)
	}
	return nil
}

func (c *Cache) DeletePattern(ctx context.Context, pattern string) error {
	fullPattern := c.key(pattern)
	var cursor uint64
	var keys []string

	for {
		scannedKeys, nextCursor, err := c.client.Scan(ctx, cursor, fullPattern, 100).Result()
		if err != nil {
			return fmt.Errorf("cache scan failed: %w", err)
		}

		keys = append(keys, scannedKeys...)
		cursor = nextCursor

		if cursor == 0 {
			break
		}
	}

	if len(keys) > 0 {
		if err := c.client.Del(ctx, keys...).Err(); err != nil {
			return fmt.Errorf("cache batch delete failed: %w", err)
		}
	}

	return nil
}

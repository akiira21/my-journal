package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strconv"
	"time"

	"github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	redis     *redis.Client
	maxReqs   int
	window    time.Duration
	keyPrefix string
}

func NewRateLimiter(rdb *redis.Client, maxRequests int, window time.Duration, keyPrefix string) *RateLimiter {
	return &RateLimiter{
		redis:     rdb,
		maxReqs:   maxRequests,
		window:    window,
		keyPrefix: keyPrefix,
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		ipHash := hashIP(ip)

		key := rl.keyPrefix + ":" + ipHash + ":" + c.FullPath()

		ctx := context.Background()

		count, err := rl.redis.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			rl.redis.Expire(ctx, key, rl.window)
		}

		remaining := rl.maxReqs - int(count)
		if remaining < 0 {
			remaining = 0
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(rl.maxReqs))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(rl.window).Unix(), 10))

		if int(count) > rl.maxReqs {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (rl *RateLimiter) CheckLimit(ctx context.Context, ip string) (int, bool, error) {
	ipHash := hashIP(ip)
	key := rl.keyPrefix + ":" + ipHash

	count, err := rl.redis.Get(ctx, key).Int()
	if err != nil {
		return rl.maxReqs, true, nil
	}

	remaining := rl.maxReqs - count
	return remaining, count < rl.maxReqs, nil
}

func (rl *RateLimiter) ResetLimit(ctx context.Context, ip string) error {
	ipHash := hashIP(ip)
	key := rl.keyPrefix + ":" + ipHash
	return rl.redis.Del(ctx, key).Err()
}

func hashIP(ip string) string {
	h := sha256.Sum256([]byte(ip))
	return hex.EncodeToString(h[:])
}

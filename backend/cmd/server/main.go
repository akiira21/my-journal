package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"github.com/akiira21/my-journal-backend/internal/config"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	redisPkg "github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/akiira21/my-journal-backend/internal/pkg/storage"
	"github.com/akiira21/my-journal-backend/internal/server"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	ctx := context.Background()

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := database.New(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connected successfully")

	if _, err := db.Pool.Exec(ctx, `ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_url TEXT`); err != nil {
		log.Fatalf("Failed to ensure posts schema compatibility: %v", err)
	}
	log.Println("Posts schema compatibility check passed")

	var redisClient *redisPkg.Client
	if cfg.RedisURL != "" {
		redisClient, err = redisPkg.New(cfg.RedisURL)
		if err != nil {
			log.Printf("Warning: Failed to connect to redis: %v", err)
		} else {
			log.Println("Redis connected successfully")
		}
	} else {
		log.Println("Warning: REDIS_URL not set, embedding worker disabled")
	}

	var r2Client *storage.R2Client
	if cfg.R2AccountID != "" && cfg.R2AccessKeyID != "" && cfg.R2SecretKey != "" && cfg.R2BucketName != "" {
		r2Client, err = storage.NewR2Client(cfg.R2AccountID, cfg.R2AccessKeyID, cfg.R2SecretKey, cfg.R2BucketName, cfg.R2PublicURL)
		if err != nil {
			log.Fatalf("Failed to create R2 client: %v", err)
		}
		log.Println("R2 client initialized successfully")
	} else {
		log.Fatal("R2 credentials are required")
	}

	var openaiClient *openai.Client
	if cfg.OpenAIKey != "" {
		openaiClient, err = openai.New(cfg.OpenAIKey)
		if err != nil {
			log.Fatalf("Failed to create OpenAI client: %v", err)
		}
		log.Println("OpenAI client initialized successfully")
	} else {
		log.Fatal("OPENAI_API_KEY is required")
	}

	srv := server.New(cfg, db, redisClient, r2Client, openaiClient)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	srv.StartWorkers(ctx)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.Run(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	cancel()
	srv.StopWorkers()

	if redisClient != nil {
		redisClient.Close()
		log.Println("Redis connection closed")
	}

	if db != nil {
		db.Close()
		log.Println("Database connection closed")
	}

	log.Println("Server exited")
}

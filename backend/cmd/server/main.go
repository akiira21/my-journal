package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/akiira21/my-journal-backend/internal/config"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	redisPkg "github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/akiira21/my-journal-backend/internal/server"
)

func main() {
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

	var redisClient *redisPkg.Client
	if cfg.RedisURL != "" {
		redisClient, err = redisPkg.New(cfg.RedisURL)
		if err != nil {
			log.Fatalf("Failed to connect to redis: %v", err)
		}
		log.Println("Redis connected successfully")
	} else {
		log.Fatal("REDIS_URL is required")
	}

	srv := server.New(cfg, db, redisClient)

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

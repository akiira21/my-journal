package config

import (
	"os"
)

type Config struct {
	Env       string
	ClientURL string

	DatabaseURL string
	SupabaseURL string
	SupabaseKey string

	RedisURL string

	R2AccountID   string
	R2AccessKeyID string
	R2SecretKey   string
	R2BucketName  string
	R2PublicURL   string

	OpenAIKey string

	GithubToken    string
	GithubUsername string

	LeetcodeUsername string

	RateLimitRequests int
	RateLimitWindow   string

	AssistantName string
	AdminAPIKey   string
}

func Load() (*Config, error) {
	return &Config{
		Env:       getEnv("ENV", "development"),
		ClientURL: getEnv("CLIENT_URL", "http://localhost:3000"),

		DatabaseURL: os.Getenv("DATABASE_URL"),
		SupabaseURL: os.Getenv("SUPABASE_URL"),
		SupabaseKey: os.Getenv("SUPABASE_SERVICE_KEY"),

		RedisURL: os.Getenv("REDIS_URL"),

		R2AccountID:   os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID: os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretKey:   os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:  os.Getenv("R2_BUCKET_NAME"),
		R2PublicURL:   os.Getenv("R2_PUBLIC_URL"),

		OpenAIKey: os.Getenv("OPENAI_API_KEY"),

		GithubToken:    os.Getenv("GITHUB_TOKEN"),
		GithubUsername: os.Getenv("GITHUB_USERNAME"),

		LeetcodeUsername: os.Getenv("LC_USERNAME"),

		RateLimitRequests: 100,
		RateLimitWindow:   "24h",

		AssistantName: getEnv("ASSISTANT_NAME", "Assistant"),
		AdminAPIKey:   os.Getenv("ADMIN_API_KEY"),
	}, nil
}

func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

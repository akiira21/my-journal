# Backend Documentation

## Overview

My Journal backend is a Go application built with Gin framework. It provides REST APIs for blog posts, embedding-based semantic search, and AI-powered chat capabilities.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Gateway Layer                     │   │
│  │  - Rate Limiting (Redis)                                │   │
│  │  - CORS                                                 │   │
│  │  - Request Logging                                      │   │
│  │  - Admin Auth Middleware                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Post       │ │ Chat       │ │ GitHub     │ │ Portfolio  │  │
│  │ Module     │ │ Module     │ │ Module     │ │ Module     │  │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘  │
│        │              │              │              │          │
│        └──────────────┴──────────────┴──────────────┘          │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Background Jobs                         │   │
│  │  - Embedding Worker (polls Redis queue)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ PostgreSQL   │     │ Redis        │     │ Cloudflare   │
│ + pgvector   │     │ (Queue)      │     │ R2 (Storage) │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Project Structure

```
backend/
├── cmd/
│   └── server/main.go          # Application entry point
├── internal/
│   ├── config/                 # Configuration loading
│   ├── middleware/             # HTTP middleware
│   │   ├── admin_auth.go       # API key authentication
│   │   ├── cors.go             # CORS handling
│   │   └── logger.go           # Request logging
│   ├── modules/                # Feature modules
│   │   └── post/               # Blog posts module
│   │       ├── admin_handler.go # Admin endpoints
│   │       ├── errors.go       # Error constants
│   │       ├── handler.go      # Public endpoints
│   │       ├── repository.go   # Data access layer
│   │       ├── service.go      # Business logic
│   │       ├── queries/        # SQL queries for sqlc
│   │       └── postdb/         # Generated sqlc code
│   ├── jobs/                   # Background jobs
│   │   └── embedding_worker.go # Embedding generation worker
│   ├── pkg/                    # Shared packages
│   │   ├── database/           # PostgreSQL connection
│   │   ├── frontmatter/       # MDX frontmatter parser
│   │   ├── openai/            # OpenAI client
│   │   ├── queue/             # Redis job queue
│   │   ├── redis/             # Redis client
│   │   └── storage/           # R2/S3 client
│   └── server/                 # Server setup and routing
├── migrations/                 # SQL migrations (goose)
├── sqlc.yaml                   # sqlc configuration
├── go.mod
└── .env.example
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `gin-gonic/gin` | HTTP framework |
| `jackc/pgx/v5` | PostgreSQL driver |
| `redis/go-redis` | Redis client |
| `pgvector/pgvector-go` | Vector operations |
| `openai/openai-go` | OpenAI API client |
| `aws/aws-sdk-go-v2` | S3/R2 client |
| `google/uuid` | UUID generation |
| `gopkg.in/yaml.v3` | YAML parsing |
| `pressly/goose` | Database migrations |
| `sqlc-dev/sqlc` | SQL to Go code generation |

---

## Environment Variables

```bash
# Server
PORT=8080
ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=disable

# Redis
REDIS_URL=redis://:password@host:6379/0

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# OpenAI
OPENAI_API_KEY=

# Admin Authentication
ADMIN_API_KEY=your-secret-key

# OAuth (future)
GITHUB_TOKEN=
GITHUB_USERNAME=
LC_USERNAME=
```

---

## Database Schema

### Tables

#### `posts`
Blog post metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | URL-friendly identifier |
| title | VARCHAR(500) | Post title |
| description | TEXT | Short description |
| content_url | TEXT | R2 object key |
| categories | TEXT[] | Category tags |
| tags | TEXT[] | Post tags |
| featured | BOOLEAN | Featured flag |
| view_count | INTEGER | View counter |
| read_time_minutes | INTEGER | Estimated read time |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Update timestamp |
| published_at | TIMESTAMPTZ | Publication timestamp |
| is_archived | BOOLEAN | Archive flag |

#### `post_embeddings`
Vector embeddings for RAG.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Foreign key to posts |
| chunk_index | INTEGER | Chunk order |
| chunk_text | TEXT | Original text |
| embedding | vector(1536) | OpenAI embedding |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `embedding_jobs`
Job tracking for embedding generation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Foreign key to posts |
| status | job_status | pending/processing/completed/failed |
| error | TEXT | Error message if failed |
| chunks_total | INTEGER | Total chunks to process |
| chunks_completed | INTEGER | Chunks processed |
| created_at | TIMESTAMPTZ | Job creation |
| started_at | TIMESTAMPTZ | Processing start |
| completed_at | TIMESTAMPTZ | Job completion |

---

## API Endpoints

### Public Endpoints

#### List Posts
```
GET /api/v1/posts?page=1&page_size=10
```

Response:
```json
{
  "posts": [
    {
      "id": "uuid",
      "slug": "my-post",
      "title": "My Post",
      "description": "Description",
      "categories": ["tech"],
      "tags": ["go", "backend"],
      "featured": false,
      "view_count": 100,
      "read_time_minutes": 5,
      "published_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 10
}
```

#### Get Post
```
GET /api/v1/posts/:slug?content=true
```

Response:
```json
{
  "id": "uuid",
  "slug": "my-post",
  "title": "My Post",
  "description": "Description",
  "content": "# My Post\n\nContent...",
  "content_url": "my-post.mdx",
  "categories": ["tech"],
  "tags": ["go"],
  "featured": false,
  "view_count": 100,
  "read_time_minutes": 5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T00:00:00Z",
  "published_at": "2024-01-01T00:00:00Z"
}
```

### Get Similar posts on a post

Endpoint: GET /api/v1/posts/:slug/related?limit=5

#### Search Posts
```
GET /api/v1/posts/search?q=golang&limit=10
```

#### Get Featured Posts
```
GET /api/v1/posts/featured?limit=5
```

#### Get Posts by Category
```
GET /api/v1/posts/category/:category?page=1&page_size=10
```

#### Get Posts by Tag
```
GET /api/v1/posts/tag/:tag?page=1&page_size=10
```

#### Track View
```
POST /api/v1/posts/:id/view
```

### Admin Endpoints

All admin endpoints require `X-Admin-Key` header.

#### Create Post from MDX
```
POST /api/v1/admin/posts/mdx
X-Admin-Key: your-secret-key

{
  "content": "---\ntitle: My Post\n---\n\n# Content",
  "publish": true
}
```

Response:
```json
{
  "id": "uuid",
  "slug": "my-post",
  "title": "My Post",
  ...
}
```

#### Create Post with Manual Fields
```
POST /api/v1/admin/posts
X-Admin-Key: your-secret-key

{
  "slug": "my-post",
  "title": "My Post",
  "description": "Description",
  "content": "# Content",
  "categories": ["tech"],
  "tags": ["go"],
  "featured": false,
  "publish": true
}
```

#### Update Post
```
PUT /api/v1/admin/posts/:id
X-Admin-Key: your-secret-key

{
  "title": "Updated Title",
  "featured": true
}
```

#### Delete Post
```
DELETE /api/v1/admin/posts/:id
X-Admin-Key: your-secret-key
```

#### Republish Post
```
POST /api/v1/admin/posts/:slug/repost
X-Admin-Key: your-secret-key

{
  "content": "---\ntitle: Updated Post\n---\n\n# New Content",
  "publish": true
}
```

---

## MDX Frontmatter Format

```yaml
---
title: My Blog Post
description: A brief description
date: 2024-01-15
slug: my-blog-post        # Optional, auto-generated from title
categories: [tech, go]
tags: [backend, api]
featured: true
draft: false
---

# My Blog Post

Content here...
```

---

## Embedding Job Flow

```
1. Admin uploads MDX via POST /api/v1/admin/posts/mdx
   ↓
2. Backend:
   - Parses frontmatter
   - Stores MDX in R2
   - Saves metadata in PostgreSQL
   - Creates embedding_jobs record (status: pending)
   - Pushes job to Redis queue
   ↓
3. Embedding Worker (background goroutine):
   - Polls Redis queue every 5 seconds
   - Updates job status to 'processing'
   - Chunks content by sections (## headers)
   - For each chunk:
     - Calls OpenAI embedding API
     - Stores vector in post_embeddings
     - Updates chunks_completed counter
   - Updates job status to 'completed' or 'failed'
```

---

## Running the Server

### Development

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run migrations
make migrate-up

# Start server
make backend-dev
# or
go run cmd/server/main.go
```

### Production

```bash
# Build binary
go build -o bin/server cmd/server/main.go

# Run with environment variables
PORT=8080 ./bin/server
```

---

## CLI: Publish Script

Located at `scripts/publish/main.go`.

### Usage

```bash
# Set API key
export ADMIN_API_KEY=your-secret-key
export API_URL=http://localhost:8080

# Publish MDX file
go run scripts/publish/main.go --file=web/content/my-post.mdx

# Dry run (validate without publishing)
go run scripts/publish/main.go --file=web/content/my-post.mdx --dry-run

# Publish immediately
go run scripts/publish/main.go --file=web/content/my-post.mdx --publish
```

### Flags

| Flag | Description |
|------|-------------|
| `--file` | Path to MDX file (required) |
| `--url` | Backend API URL (default: API_URL env or localhost) |
| `--key` | Admin API key (default: ADMIN_API_KEY env) |
| `--publish` | Publish immediately (set published_at) |
| `--dry-run` | Parse and validate without publishing |
| `--slug` | Override slug (default: from frontmatter) |
| `--config` | Path to config file |

---

## Error Handling

All errors return JSON:

```json
{
  "error": "error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing API key)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security

### Authentication

Admin endpoints require API key header:
```
X-Admin-Key: your-secret-key
```

The key is compared against `ADMIN_API_KEY` environment variable.

### Input Validation

| Field | Max Length |
|-------|------------|
| title | 500 chars |
| description | 2000 chars |
| content | 10 MB |
| slug | 255 chars |

### SQL Injection Prevention

All database queries use sqlc-generated parameterized queries.

### Path Traversal Prevention

Slug is sanitized before constructing R2 object key.

---

## Rate Limiting

Redis-based rate limiting is available via middleware. Configure with:

```
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=24h
```

---

## Health Check

```
GET /api/v1/health
```

Response:
```json
{
  "status": "ok",
  "env": "development",
  "database": "connected",
  "redis": "connected"
}
```

---

## Database Migrations

Using `goose`:

```bash
# Create new migration
goose create migration_name sql

# Apply migrations
goose postgres $DATABASE_URL up

# Rollback
goose postgres $DATABASE_URL down

# Status
goose postgres $DATABASE_URL status
```

---

## Running Tests

```bash
go test ./...
go test -v ./internal/modules/post/...
```

---

## Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: myjournal
      POSTGRES_PASSWORD: myjournal123
      POSTGRES_DB: myjournal
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

Start: `docker-compose up -d`
# My Journal

A personal blog with an AI assistant that helps readers explore and understand content through natural conversation.

## What it does

- **AI-powered blog assistant** — Ask questions about any blog post in natural language and get answers grounded in the actual content, with citations to relevant posts
- **Semantic content search** — Find related posts and answers based on meaning, not just keyword matching
- **Conversational memory** — The assistant remembers context across messages within a session for follow-up questions
- **Rich reading experience** — Syntax-highlighted code, math equations, callouts, tables, and interactive images within posts
- **Smart content organization** — Posts are categorized, tagged, and searchable with pagination
- **Admin publishing pipeline** — Upload MDX files with YAML frontmatter to publish or update posts, with automatic content indexing
- **Hybrid search (BM25 + embeddings)** — Blog search and AI assistant retrieval combine PostgreSQL full-text search with OpenAI vector similarity for better results on both exact keywords and conceptual queries

### Publish via Web UI (Recommended)

The easiest way to publish is through the built-in admin web interface:

1. Start the backend server
2. Visit `http://localhost:8080/api/v1/admin/publish`
3. Enter your admin API key
4. Drag & drop an MDX file (with YAML frontmatter)
5. Optionally set a publish date
6. Click **Publish Post**

The page validates frontmatter client-side and shows a preview before publishing.

### Publish via CLI

For bulk uploads or CI/CD pipelines, use the publish script:

```bash
cd scripts/publish

export API_URL="https://your-api.com"
export ADMIN_API_KEY="your-admin-key"

go run main.go --file ../../next-app/content/my-post.mdx --publish

# Dry-run to validate frontmatter without publishing
go run main.go --file ../../next-app/content/my-post.mdx --dry-run

# Override slug
go run main.go --file ../../next-app/content/my-post.mdx --slug custom-slug --publish
```

### Publish All Posts (Bulk Upload)

```bash
cd scripts/publish

for file in ../../next-app/content/*.mdx; do
  echo "Publishing: $file"
  go run main.go --file "$file" --publish
  sleep 1  # Rate limit between uploads
done
```

### What Happens When You Publish

1. The script parses YAML frontmatter and validates required fields
2. Sends the full MDX content to `POST /api/v1/admin/posts/mdx`
3. Backend extracts metadata and saves the post to PostgreSQL
4. Uploads the raw MDX file to Cloudflare R2 for frontend rendering
5. Creates an embedding job in the Redis queue
6. The embedding worker chunks the content, generates OpenAI embeddings, and stores both the vector and chunk text in PostgreSQL for hybrid search

### Build the Publish Script

```bash
cd scripts/publish
go build -o publish

# Then use the binary
./publish --file ../../web/content/post.mdx --publish
```

## What's next

### Frontend

- [x] ~~Fix posts page search bar~~ (Done: command menu calls `/posts/search?q=` with debounced hybrid search)
- [x] ~~Chat history persistence~~ (Done: auto-restore recent session by IP, history dropdown, new session button)
- [ ] Redesign post page: fix font sizes, spacing, hero header with category badges + metadata bar, and content padding
- [ ] Reading experience: top progress bar that fills as you scroll, smooth scroll behavior, fixed back-to-top button
- [ ] Share buttons: Open Graph tags per post, Twitter Card markup, Web Share API fallback, copy-link toast
- [ ] Navigation: add API endpoints for previous/next post (`/posts/:slug/prev`, `/posts/:slug/next`), show related post cards at bottom
- [ ] Focus reading mode: button to hide nav and footer, widen content, save toggle state in `localStorage`
- [ ] Inline "Ask Assistant": floating button on posts that opens assistant with post context pre-filled

### Backend

- [x] ~~Fix assistant search and context~~ (Done: hybrid search with BM25 + embeddings via Reciprocal Rank Fusion in PostgreSQL)
- [x] ~~Chat session history by IP~~ (Done: `GET /chat/history`, auto-reuse recent session, `MAX_MESSAGES_PER_SESSION` trim)
- [ ] Query rewriting: expand small/vague user queries into richer search queries before generating embeddings
- [ ] Reranking: fetch 10–20 candidate chunks, then run a cross-encoder reranker to pick the most relevant ones
- [ ] Assistant structured output: add OpenAI function calling so assistant can return tables, step-by-step guides, or JSON when asked
- [ ] Analytics: add Umami tracking for page views, assistant usage, and search queries

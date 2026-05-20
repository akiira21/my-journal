# My Journal

A personal blog with an AI assistant that helps readers explore and understand content through natural conversation.

## What it does

- **AI-powered blog assistant** — Ask questions about any blog post in natural language and get answers grounded in the actual content, with citations to relevant posts
- **Semantic content search** — Find related posts and answers based on meaning, not just keyword matching
- **Conversational memory** — The assistant remembers context across messages within a session for follow-up questions
- **Rich reading experience** — Syntax-highlighted code, math equations, callouts, tables, and interactive images within posts
- **Smart content organization** — Posts are categorized, tagged, and searchable with pagination
- **Admin publishing pipeline** — Upload MDX files with YAML frontmatter to publish or update posts, with automatic content indexing

## What's next

### Frontend

- [ ] Redesign post page: fix font sizes, spacing, hero header with category badges + metadata bar, and content padding
- [ ] Fix posts page search bar, didn't correctly find posts.
- [ ] Reading experience: top progress bar that fills as you scroll, smooth scroll behavior, fixed back-to-top button
- [ ] Share buttons: Open Graph tags per post, Twitter Card markup, Web Share API fallback, copy-link toast
- [ ] Navigation: add API endpoints for previous/next post (`/posts/:slug/prev`, `/posts/:slug/next`), show related post cards at bottom
- [ ] Focus reading mode: button to hide nav and footer, widen content, save toggle state in `localStorage`
- [ ] Inline "Ask Assistant": floating button on posts that opens assistant with post context pre-filled 

### Backend

- [ ] Fix assistant search and context:
  - Rewrite small/vague user queries into richer search queries before generating embeddings
  - Combine BM25 keyword search with embedding cosine similarity in one retrieval step
  - Fetch 10–20 candidate chunks, then run a reranker to pick the most relevant ones
  - Set a hard relevance cutoff — if no chunk scores high enough, reject the request and show a fallback message instead of sending weak context to the LLM
- [ ] Assistant structured output: add OpenAI function calling so assistant can return tables, step-by-step guides, or JSON when asked
- [ ] Analytics: add Umami tracking for page views, assistant usage, and search queries

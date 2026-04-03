export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url?: string | null;
  categories: string[];
  tags: string[];
  featured: boolean;
  view_count: number;
  read_time_minutes: number | null;
  published_at: string | null;
};

export type PostsPageResponse = {
  posts: PostSummary[];
  total: number;
  page: number;
  page_size: number;
};

export type ChatSource = {
  post_id: string;
  post_slug: string;
  title: string;
  score: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type ChatSessionResponse = {
  session_id: string;
  messages: ChatMessage[];
};

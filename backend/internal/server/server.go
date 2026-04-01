package server

import (
	"context"
	"net/http"
	"time"

	"github.com/akiira21/my-journal-backend/internal/config"
	"github.com/akiira21/my-journal-backend/internal/jobs"
	"github.com/akiira21/my-journal-backend/internal/middleware"
	"github.com/akiira21/my-journal-backend/internal/modules/chat"
	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	"github.com/akiira21/my-journal-backend/internal/pkg/queue"
	"github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/akiira21/my-journal-backend/internal/pkg/storage"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config          *config.Config
	router          *gin.Engine
	db              *database.DB
	redis           *redis.Client
	r2              *storage.R2Client
	openai          *openai.Client
	postRepo        *post.Repository
	postSvc         *post.Service
	postHdlr        *post.Handler
	adminHdlr       *post.AdminHandler
	chatRepo        *chat.Repository
	chatSvc         *chat.Service
	chatHdlr        *chat.Handler
	queue           *queue.Queue
	embeddingWorker *jobs.EmbeddingWorker
}

func New(cfg *config.Config, db *database.DB, redis *redis.Client, r2 *storage.R2Client, openaiClient *openai.Client) *Server {
	gin.SetMode(gin.ReleaseMode)
	if cfg.IsDevelopment() {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.ClientURL))
	router.Use(gin.Recovery())

	srv := &Server{
		config: cfg,
		router: router,
		db:     db,
		redis:  redis,
		r2:     r2,
		openai: openaiClient,
	}

	srv.initModules()
	srv.registerRoutes()

	return srv
}

func (s *Server) initModules() {
	s.postRepo = post.NewRepository(s.db)
	s.postSvc = post.NewService(s.postRepo, s.r2)
	s.postHdlr = post.NewHandler(s.postSvc)

	if s.redis != nil {
		s.queue = queue.NewQueue(s.redis)
		s.adminHdlr = post.NewAdminHandler(s.postSvc, s.queue)
	} else {
		s.adminHdlr = post.NewAdminHandler(s.postSvc, nil)
	}

	s.chatRepo = chat.NewRepository(s.db, s.postRepo)
	s.chatSvc = chat.NewService(s.chatRepo, s.openai, s.postRepo)
	s.chatHdlr = chat.NewHandler(s.chatSvc)

	if s.openai != nil && s.redis != nil {
		s.embeddingWorker = jobs.NewEmbeddingWorker(s.redis, s.postRepo, s.openai)
	}
}

func (s *Server) StartWorkers(ctx context.Context) {
	if s.embeddingWorker != nil {
		s.embeddingWorker.Start(ctx)
	}
}

func (s *Server) StopWorkers() {
	if s.embeddingWorker != nil {
		s.embeddingWorker.Stop()
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

func (s *Server) registerRoutes() {
	v1 := s.router.Group("/api/v1")
	{
		v1.GET("/health", s.healthHandler)
	}

	posts := v1.Group("/posts")
	{
		posts.GET("", s.postHdlr.ListPosts)
		posts.GET("/featured", s.postHdlr.ListFeatured)
		posts.GET("/search", s.postHdlr.Search)
		posts.GET("/category/:category", s.postHdlr.ListByCategory)
		posts.GET("/tag/:tag", s.postHdlr.ListByTag)
		posts.GET("/:slug", s.postHdlr.GetPost)
		posts.GET("/:slug/related", s.postHdlr.GetRelated)
		posts.POST("/:id/view", s.postHdlr.IncrementViewCount)
	}

	admin := v1.Group("/admin")
	admin.Use(middleware.AdminAuth(s.config.AdminAPIKey))
	{
		admin.POST("/posts", s.adminHdlr.CreatePost)
		admin.POST("/posts/mdx", s.adminHdlr.CreateFromMDX)
		admin.PUT("/posts/:id", s.adminHdlr.UpdatePost)
		admin.DELETE("/posts/:id", s.adminHdlr.DeletePost)
		admin.POST("/posts/:slug/repost", s.adminHdlr.Repost)
	}

	chatGroup := v1.Group("/chat")
	{
		chatGroup.POST("/sessions", s.chatHdlr.CreateSession)
		chatGroup.GET("/sessions/:id", s.chatHdlr.GetSession)
		chatGroup.POST("/message", s.chatHdlr.Chat)
		chatGroup.POST("/stream", s.chatHdlr.ChatStream)
	}
}

func (s *Server) healthHandler(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	response := gin.H{
		"status": "ok",
		"env":    s.config.Env,
	}

	if s.db != nil {
		if err := s.db.HealthCheck(ctx); err != nil {
			response["database"] = "disconnected"
			response["status"] = "degraded"
			c.JSON(http.StatusServiceUnavailable, response)
			return
		}
		response["database"] = "connected"
	}

	if s.redis != nil {
		if err := s.redis.HealthCheck(ctx); err != nil {
			response["redis"] = "disconnected"
			response["status"] = "degraded"
			c.JSON(http.StatusServiceUnavailable, response)
			return
		}
		response["redis"] = "connected"
	}

	c.JSON(http.StatusOK, response)
}

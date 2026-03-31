package server

import (
	"context"
	"net/http"
	"time"

	"github.com/akiira21/my-journal-backend/internal/config"
	"github.com/akiira21/my-journal-backend/internal/middleware"
	"github.com/akiira21/my-journal-backend/internal/modules/post"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	"github.com/akiira21/my-journal-backend/internal/pkg/openai"
	"github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/akiira21/my-journal-backend/internal/pkg/storage"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config   *config.Config
	router   *gin.Engine
	db       *database.DB
	redis    *redis.Client
	R2       *storage.R2Client
	openai   *openai.Client
	postRepo *post.Repository
	postSvc  *post.Service
	postHdlr *post.Handler
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
		R2:     r2,
		openai: openaiClient,
	}

	srv.initModules()
	srv.registerRoutes()

	return srv
}

func (s *Server) initModules() {
	s.postRepo = post.NewRepository(s.db)
	s.postSvc = post.NewService(s.postRepo, s.R2)
	s.postHdlr = post.NewHandler(s.postSvc)
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
		posts.POST("", s.postHdlr.CreatePost)
		posts.PUT("/:id", s.postHdlr.UpdatePost)
		posts.DELETE("/:id", s.postHdlr.DeletePost)
		posts.POST("/:id/archive", s.postHdlr.ArchivePost)
		posts.POST("/:id/view", s.postHdlr.IncrementViewCount)
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

package server

import (
	"context"
	"net/http"
	"time"

	"github.com/akiira21/my-journal-backend/internal/config"
	"github.com/akiira21/my-journal-backend/internal/middleware"
	"github.com/akiira21/my-journal-backend/internal/pkg/database"
	redisPkg "github.com/akiira21/my-journal-backend/internal/pkg/redis"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config *config.Config
	router *gin.Engine
	db     *database.DB
	redis  *redisPkg.Client
}

func New(cfg *config.Config, db *database.DB, redis *redisPkg.Client) *Server {
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
	}

	srv.registerRoutes()

	return srv
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

func (s *Server) registerRoutes() {
	v1 := s.router.Group("/api/v1")
	{
		v1.GET("/health", s.healthHandler)
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

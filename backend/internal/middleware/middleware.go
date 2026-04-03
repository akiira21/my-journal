package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		gin.DefaultWriter.Write([]byte(
			"[" + time.Now().Format(time.RFC3339) + "] " +
				c.Request.Method + " " +
				path + " " +
				string(rune(status)) + " " +
				latency.String() + "\n",
		))
	}
}

func CORS(clientURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		allowedOrigin := clientURL
		if allowedOrigin == "" {
			allowedOrigin = "http://localhost:3000"
		}

		if origin != "" && allowedOrigin != "" && origin == allowedOrigin {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Admin-Key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

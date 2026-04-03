package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AdminAuth(adminKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if adminKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "admin key not configured"})
			c.Abort()
			return
		}

		authHeader := c.GetHeader("X-Admin-Key")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing admin key"})
			c.Abort()
			return
		}

		if !strings.EqualFold(authHeader, adminKey) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid admin key"})
			c.Abort()
			return
		}

		c.Next()
	}
}

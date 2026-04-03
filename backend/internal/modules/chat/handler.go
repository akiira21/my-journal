package chat

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type createSessionRequest struct {
	SessionID string `json:"session_id"`
}

type createSessionResponse struct {
	SessionID string `json:"session_id"`
}

type chatRequest struct {
	SessionID string `json:"session_id" binding:"required"`
	Message   string `json:"message" binding:"required"`
}

type chatResponse struct {
	Message   string   `json:"message"`
	Sources   []Source `json:"sources,omitempty"`
	SessionID string   `json:"session_id"`
}

type sessionResponse struct {
	SessionID string    `json:"session_id"`
	Messages  []Message `json:"messages"`
}

func (h *Handler) CreateSession(c *gin.Context) {
	var req createSessionRequest
	c.ShouldBindJSON(&req)

	sessionID := req.SessionID
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	ipHash := hashIP(c.ClientIP())

	session, err := h.service.CreateSession(c.Request.Context(), sessionID, ipHash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	c.JSON(http.StatusCreated, createSessionResponse{
		SessionID: session.SessionID,
	})
}

func (h *Handler) GetSession(c *gin.Context) {
	sessionID := c.Param("id")

	session, err := h.service.GetSession(c.Request.Context(), sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	c.JSON(http.StatusOK, sessionResponse{
		SessionID: session.SessionID,
		Messages:  session.Messages,
	})
}

func (h *Handler) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message and session_id are required"})
		return
	}

	response, err := h.service.Chat(c.Request.Context(), ChatRequest{
		SessionID: req.SessionID,
		Message:   req.Message,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process message"})
		return
	}

	c.JSON(http.StatusOK, chatResponse{
		Message:   response.Message,
		Sources:   response.Sources,
		SessionID: response.SessionID,
	})
}

func (h *Handler) ChatStream(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message and session_id are required"})
		return
	}

	stream, chatCtx, err := h.service.ChatStream(c.Request.Context(), ChatRequest{
		SessionID: req.SessionID,
		Message:   req.Message,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start stream"})
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	var fullResponse string
	streamCompleted := false
	for chunk := range stream {
		if chunk.Error != nil {
			data, _ := json.Marshal(gin.H{"error": chunk.Error.Error()})
			c.Writer.Write([]byte("event: error\ndata: " + string(data) + "\n\n"))
			c.Writer.Flush()
			return
		}

		if chunk.Done {
			streamCompleted = true
			break
		}

		fullResponse += chunk.Content
		data, _ := json.Marshal(gin.H{"content": chunk.Content})
		c.Writer.Write([]byte("event: message\ndata: " + string(data) + "\n\n"))
		c.Writer.Flush()
	}

	sources := make([]Source, 0, len(chatCtx.PostContents))
	for _, pc := range chatCtx.PostContents {
		sources = append(sources, Source{
			PostID:   pc.Post.ID,
			PostSlug: pc.Post.Slug,
			Title:    pc.Post.Title,
			Score:    pc.Score,
		})
	}

	if len(sources) > 0 {
		data, _ := json.Marshal(gin.H{"sources": sources})
		c.Writer.Write([]byte("event: sources\ndata: " + string(data) + "\n\n"))
		c.Writer.Flush()
	}

	if streamCompleted {
		data, _ := json.Marshal(gin.H{"done": true})
		c.Writer.Write([]byte("event: done\ndata: " + string(data) + "\n\n"))
		c.Writer.Flush()
	}

	newMessages := append(chatCtx.Session.Messages, []Message{
		{Role: "user", Content: req.Message, CreatedAt: time.Now()},
		{Role: "assistant", Content: fullResponse, CreatedAt: time.Now()},
	}...)

	h.service.SaveMessages(c.Request.Context(), req.SessionID, newMessages)

	_, _ = io.ReadAll(c.Request.Body)
}

func hashIP(ip string) *string {
	if ip == "" {
		return nil
	}
	hash := sha256.Sum256([]byte(ip))
	hashed := hex.EncodeToString(hash[:])
	return &hashed
}

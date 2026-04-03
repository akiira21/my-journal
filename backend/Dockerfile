# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Allow Go to download required toolchain version
ENV GOTOOLCHAIN=auto

# Install dependencies
RUN apk add --no-cache git gcc musl-dev

# Install goose for migrations
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# Copy go mod files
COPY go.mod go.sum* ./

# Copy source code
COPY . .

# Download dependencies
RUN go mod download || go mod tidy

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary, goose, migrations, and start script from builder
COPY --from=builder /app/server .
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/start.sh .

# Make start script executable
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Run with migrations
CMD ["/app/start.sh"]
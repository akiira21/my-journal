# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Allow Go to download required toolchain version
ENV GOTOOLCHAIN=auto

# Install dependencies
RUN apk add --no-cache git gcc musl-dev

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

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .

# Expose port
EXPOSE 8080

# Run
CMD ["./server"]
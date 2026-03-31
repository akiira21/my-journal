package post

import "errors"

var (
	ErrInvalidSlug        = errors.New("invalid slug format")
	ErrTitleTooLong       = errors.New("title exceeds maximum length")
	ErrDescriptionTooLong = errors.New("description exceeds maximum length")
	ErrContentTooLarge    = errors.New("content exceeds maximum size")
	ErrPostNotFound       = errors.New("post not found")
	ErrUnauthorized       = errors.New("unauthorized")
)

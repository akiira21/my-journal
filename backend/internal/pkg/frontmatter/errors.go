package frontmatter

import "errors"

var (
	ErrNoFrontmatter      = errors.New("no frontmatter found in content")
	ErrInvalidFrontmatter = errors.New("invalid frontmatter format")
	ErrMissingTitle       = errors.New("title is required in frontmatter")
	ErrInvalidDate        = errors.New("invalid date format in frontmatter")
)

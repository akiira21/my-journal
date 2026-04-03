package frontmatter

import (
	"bytes"
	"regexp"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

var frontmatterRegex = regexp.MustCompile(`(?s)^---\n(.*?)\n---\n(.*)$`)

type Frontmatter struct {
	Title       string   `yaml:"title"`
	Description string   `yaml:"description"`
	Cover       string   `yaml:"cover"`
	Date        string   `yaml:"date"`
	Slug        string   `yaml:"slug"`
	Categories  []string `yaml:"categories"`
	Tags        []string `yaml:"tags"`
	Featured    bool     `yaml:"featured"`
	Draft       bool     `yaml:"draft"`
}

type ParsedContent struct {
	Title       string
	Description string
	CoverURL    string
	Slug        string
	Categories  []string
	Tags        []string
	Featured    bool
	PublishedAt *time.Time
	Content     string
}

func Parse(content string) (*ParsedContent, error) {
	matches := frontmatterRegex.FindStringSubmatch(content)
	if matches == nil {
		return nil, ErrNoFrontmatter
	}

	fmYaml := matches[1]
	body := strings.TrimSpace(matches[2])

	var fm Frontmatter
	if err := yaml.Unmarshal([]byte(fmYaml), &fm); err != nil {
		return nil, ErrInvalidFrontmatter
	}

	if fm.Title == "" {
		return nil, ErrMissingTitle
	}

	slug := fm.Slug
	if slug == "" {
		slug = generateSlug(fm.Title)
	}

	var publishedAt *time.Time
	if fm.Date != "" {
		t, err := parseDate(fm.Date)
		if err == nil {
			publishedAt = &t
		}
	}

	categories := fm.Categories
	if categories == nil {
		categories = []string{}
	}

	tags := fm.Tags
	if tags == nil {
		tags = []string{}
	}

	return &ParsedContent{
		Title:       fm.Title,
		Description: fm.Description,
		CoverURL:    fm.Cover,
		Slug:        slug,
		Categories:  categories,
		Tags:        tags,
		Featured:    fm.Featured,
		PublishedAt: publishedAt,
		Content:     body,
	}, nil
}

func ParseFile(data []byte) (*ParsedContent, error) {
	return Parse(string(data))
}

func parseDate(dateStr string) (time.Time, error) {
	layouts := []string{
		"2006-01-02",
		"2006-01-02T15:04:05",
		"2006-01-02T15:04:05Z07:00",
		time.RFC3339,
	}

	for _, layout := range layouts {
		if t, err := time.Parse(layout, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, ErrInvalidDate
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)

	var buf bytes.Buffer
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			buf.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			buf.WriteRune('-')
		}
	}

	slug = buf.String()
	slug = strings.Trim(slug, "-")

	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	if len(slug) > 200 {
		slug = slug[:200]
	}

	return slug
}

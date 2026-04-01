package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

type Config struct {
	APIURL  string `json:"api_url"`
	APIKey  string `json:"api_key"`
	Setting string `json:"setting"`
}

type Frontmatter struct {
	Title       string   `yaml:"title"`
	Description string   `yaml:"description"`
	Date        string   `yaml:"date"`
	Slug        string   `yaml:"slug"`
	Categories  []string `yaml:"categories"`
	Tags        []string `yaml:"tags"`
	Featured    bool     `yaml:"featured"`
	Draft       bool     `yaml:"draft"`
}

type PublishRequest struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Content     string   `json:"content"`
	Categories  []string `json:"categories"`
	Tags        []string `json:"tags"`
	Featured    bool     `json:"featured"`
	Publish     bool     `json:"publish"`
}

type AdminMDXRequest struct {
	Content string `json:"content"`
	Publish bool   `json:"publish"`
}

func main() {
	_ = godotenv.Load("../../backend/.env")

	file := flag.String("file", "", "Path to MDX file to publish")
	apiURLFlag := flag.String("url", "", "Backend API URL (default: API_URL env or http://localhost:8080)")
	apiKeyFlag := flag.String("key", "", "Admin API key (default: ADMIN_API_KEY env)")
	publish := flag.Bool("publish", false, "Publish immediately (set published_at)")
	dryRun := flag.Bool("dry-run", false, "Parse and validate without publishing")
	slug := flag.String("slug", "", "Override slug (default: from frontmatter)")
	configPath := flag.String("config", "", "Path to config file")

	flag.Parse()

	if *file == "" {
		fmt.Println("Error: --file is required")
		flag.Usage()
		os.Exit(1)
	}

	var cfg Config
	if *configPath != "" {
		var err error
		cfg, err = loadConfig(*configPath)
		if err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}
	}

	apiURLEnv := getEnv("API_URL", "http://localhost:8080")
	apiKeyEnv := os.Getenv("ADMIN_API_KEY")

	url := firstNonEmpty(*apiURLFlag, cfg.APIURL, apiURLEnv)
	key := firstNonEmpty(*apiKeyFlag, cfg.APIKey, apiKeyEnv)

	if key == "" {
		log.Fatal("Admin API key is required (use --key, ADMIN_API_KEY env, or config file)")
	}

	content, err := os.ReadFile(*file)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	frontmatter, body, err := parseFrontmatter(content)
	if err != nil {
		log.Fatalf("Failed to parse frontmatter: %v", err)
	}

	if *slug != "" {
		frontmatter.Slug = *slug
	}

	if frontmatter.Slug == "" {
		frontmatter.Slug = generateSlug(frontmatter.Title)
	}

	if frontmatter.Title == "" {
		log.Fatal("Title is required in frontmatter")
	}

	fmt.Printf("File: %s\n", *file)
	fmt.Printf("Title: %s\n", frontmatter.Title)
	fmt.Printf("Slug: %s\n", frontmatter.Slug)
	fmt.Printf("Categories: %v\n", frontmatter.Categories)
	fmt.Printf("Tags: %v\n", frontmatter.Tags)
	fmt.Printf("Publish: %v\n", *publish || !frontmatter.Draft)
	fmt.Printf("Content length: %d bytes\n", len(body))

	if *dryRun {
		fmt.Println("\n--- DRY RUN COMPLETE ---")
		return
	}

	fullContent := string(content)

	req := AdminMDXRequest{
		Content: fullContent,
		Publish: *publish || !frontmatter.Draft,
	}

	reqBody, err := json.Marshal(req)
	if err != nil {
		log.Fatalf("Failed to marshal request: %v", err)
	}

	httpReq, err := http.NewRequest("POST", url+"/api/v1/admin/posts/mdx", bytes.NewBuffer(reqBody))
	if err != nil {
		log.Fatalf("Failed to create request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Admin-Key", key)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Fatalf("Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Failed to read response: %v", err)
	}

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		log.Fatalf("Failed to publish: %s\n%s", resp.Status, string(respBody))
	}

	fmt.Printf("\nPost published successfully!\n")
	fmt.Printf("Response: %s\n", string(respBody))
}

func parseFrontmatter(content []byte) (*Frontmatter, string, error) {
	contentStr := string(content)

	if !strings.HasPrefix(contentStr, "---\n") {
		return nil, "", fmt.Errorf("no frontmatter found")
	}

	end := strings.Index(contentStr[4:], "\n---\n")
	if end == -1 {
		return nil, "", fmt.Errorf("frontmatter not closed")
	}

	fmContent := contentStr[4 : end+4]
	body := strings.TrimSpace(contentStr[end+8:])

	var fm Frontmatter
	if err := yaml.Unmarshal([]byte(fmContent), &fm); err != nil {
		return nil, "", fmt.Errorf("failed to parse frontmatter: %w", err)
	}

	return &fm, body, nil
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

func loadConfig(path string) (Config, error) {
	var cfg Config

	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, err
	}

	if strings.HasSuffix(path, ".json") {
		err = json.Unmarshal(data, &cfg)
	} else {
		err = yaml.Unmarshal(data, &cfg)
	}

	return cfg, err
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

func createMultipartBody(file string, req PublishRequest) (*bytes.Buffer, string, error) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	fileWriter, err := writer.CreateFormFile("file", filepath.Base(file))
	if err != nil {
		return nil, "", err
	}

	fileData, err := os.ReadFile(file)
	if err != nil {
		return nil, "", err
	}

	_, err = fileWriter.Write(fileData)
	if err != nil {
		return nil, "", err
	}

	_ = writer.WriteField("slug", req.Slug)
	_ = writer.WriteField("title", req.Title)
	_ = writer.WriteField("description", req.Description)
	_ = writer.WriteField("featured", fmt.Sprintf("%v", req.Featured))
	_ = writer.WriteField("publish", fmt.Sprintf("%v", req.Publish))

	if req.Categories != nil {
		_ = writer.WriteField("categories", strings.Join(req.Categories, ","))
	}
	if req.Tags != nil {
		_ = writer.WriteField("tags", strings.Join(req.Tags, ","))
	}

	err = writer.Close()
	if err != nil {
		return nil, "", err
	}

	return &buf, writer.FormDataContentType(), nil
}

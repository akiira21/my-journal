package post

import (
	"context"
	"fmt"
	"time"

	"github.com/akiira21/my-journal-backend/internal/pkg/cache"
)

const (
	postMetaTTL       = 1 * time.Hour
	postContentTTL    = 1 * time.Hour
	postRelatedTTL    = 30 * time.Minute
	postListTTL       = 15 * time.Minute
	postSearchTTL     = 5 * time.Minute
	postFeaturedTTL   = 15 * time.Minute
)

type PostCache struct {
	c *cache.Cache
}

func NewPostCache(c *cache.Cache) *PostCache {
	return &PostCache{c: c}
}

func (pc *PostCache) metaKey(slug string) string {
	return fmt.Sprintf("meta:%s", slug)
}

func (pc *PostCache) contentKey(slug string) string {
	return fmt.Sprintf("content:%s", slug)
}

func (pc *PostCache) relatedKey(slug string) string {
	return fmt.Sprintf("related:%s", slug)
}

func (pc *PostCache) listKey(page, pageSize int) string {
	return fmt.Sprintf("list:all:%d:%d", page, pageSize)
}

func (pc *PostCache) featuredKey(limit int) string {
	return fmt.Sprintf("list:featured:%d", limit)
}

func (pc *PostCache) categoryKey(category string, page, pageSize int) string {
	return fmt.Sprintf("list:category:%s:%d:%d", category, page, pageSize)
}

func (pc *PostCache) tagKey(tag string, page, pageSize int) string {
	return fmt.Sprintf("list:tag:%s:%d:%d", tag, page, pageSize)
}

func (pc *PostCache) searchKey(query string, limit, offset int) string {
	return fmt.Sprintf("search:%s:%d:%d", query, limit, offset)
}

func (pc *PostCache) GetPostMeta(ctx context.Context, slug string) (*Post, bool, error) {
	var post Post
	found, err := pc.c.Get(ctx, pc.metaKey(slug), &post)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return &post, true, nil
}

func (pc *PostCache) SetPostMeta(ctx context.Context, slug string, post *Post) error {
	return pc.c.Set(ctx, pc.metaKey(slug), post, postMetaTTL)
}

func (pc *PostCache) DeletePostMeta(ctx context.Context, slug string) error {
	return pc.c.Delete(ctx, pc.metaKey(slug))
}

func (pc *PostCache) GetPostContent(ctx context.Context, slug string) (string, bool, error) {
	var content string
	found, err := pc.c.Get(ctx, pc.contentKey(slug), &content)
	if err != nil {
		return "", false, err
	}
	if !found {
		return "", false, nil
	}
	return content, true, nil
}

func (pc *PostCache) SetPostContent(ctx context.Context, slug string, content string) error {
	return pc.c.Set(ctx, pc.contentKey(slug), content, postContentTTL)
}

func (pc *PostCache) DeletePostContent(ctx context.Context, slug string) error {
	return pc.c.Delete(ctx, pc.contentKey(slug))
}

func (pc *PostCache) GetRelatedPosts(ctx context.Context, slug string) ([]SearchResult, bool, error) {
	var results []SearchResult
	found, err := pc.c.Get(ctx, pc.relatedKey(slug), &results)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return results, true, nil
}

func (pc *PostCache) SetRelatedPosts(ctx context.Context, slug string, results []SearchResult) error {
	return pc.c.Set(ctx, pc.relatedKey(slug), results, postRelatedTTL)
}

func (pc *PostCache) DeleteRelatedPosts(ctx context.Context, slug string) error {
	return pc.c.Delete(ctx, pc.relatedKey(slug))
}

func (pc *PostCache) GetPostList(ctx context.Context, page, pageSize int) (*cachedListResult, bool, error) {
	var result cachedListResult
	found, err := pc.c.Get(ctx, pc.listKey(page, pageSize), &result)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return &result, true, nil
}

func (pc *PostCache) SetPostList(ctx context.Context, page, pageSize int, posts []PostSummary, total int64) error {
	return pc.c.Set(ctx, pc.listKey(page, pageSize), cachedListResult{Posts: posts, Total: total}, postListTTL)
}

func (pc *PostCache) GetFeaturedPosts(ctx context.Context, limit int) ([]PostSummary, bool, error) {
	var posts []PostSummary
	found, err := pc.c.Get(ctx, pc.featuredKey(limit), &posts)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return posts, true, nil
}

func (pc *PostCache) SetFeaturedPosts(ctx context.Context, limit int, posts []PostSummary) error {
	return pc.c.Set(ctx, pc.featuredKey(limit), posts, postFeaturedTTL)
}

func (pc *PostCache) GetCategoryPosts(ctx context.Context, category string, page, pageSize int) ([]PostSummary, bool, error) {
	var posts []PostSummary
	found, err := pc.c.Get(ctx, pc.categoryKey(category, page, pageSize), &posts)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return posts, true, nil
}

func (pc *PostCache) SetCategoryPosts(ctx context.Context, category string, page, pageSize int, posts []PostSummary) error {
	return pc.c.Set(ctx, pc.categoryKey(category, page, pageSize), posts, postListTTL)
}

func (pc *PostCache) GetTagPosts(ctx context.Context, tag string, page, pageSize int) ([]PostSummary, bool, error) {
	var posts []PostSummary
	found, err := pc.c.Get(ctx, pc.tagKey(tag, page, pageSize), &posts)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return posts, true, nil
}

func (pc *PostCache) SetTagPosts(ctx context.Context, tag string, page, pageSize int, posts []PostSummary) error {
	return pc.c.Set(ctx, pc.tagKey(tag, page, pageSize), posts, postListTTL)
}

func (pc *PostCache) GetSearchResults(ctx context.Context, query string, limit, offset int) ([]PostSummary, bool, error) {
	var posts []PostSummary
	found, err := pc.c.Get(ctx, pc.searchKey(query, limit, offset), &posts)
	if err != nil {
		return nil, false, err
	}
	if !found {
		return nil, false, nil
	}
	return posts, true, nil
}

func (pc *PostCache) SetSearchResults(ctx context.Context, query string, limit, offset int, posts []PostSummary) error {
	return pc.c.Set(ctx, pc.searchKey(query, limit, offset), posts, postSearchTTL)
}

func (pc *PostCache) InvalidatePost(ctx context.Context, slug string) error {
	if err := pc.c.Delete(ctx, pc.metaKey(slug)); err != nil {
		return err
	}
	if err := pc.c.Delete(ctx, pc.contentKey(slug)); err != nil {
		return err
	}
	if err := pc.c.Delete(ctx, pc.relatedKey(slug)); err != nil {
		return err
	}
	return nil
}

func (pc *PostCache) InvalidateLists(ctx context.Context) error {
	return pc.c.DeletePattern(ctx, "list:*")
}

func (pc *PostCache) InvalidateSearch(ctx context.Context) error {
	return pc.c.DeletePattern(ctx, "search:*")
}

type cachedListResult struct {
	Posts []PostSummary `json:"posts"`
	Total int64         `json:"total"`
}

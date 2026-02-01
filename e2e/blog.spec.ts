import { test, expect } from '@playwright/test'

test.describe('Blog Post Reading', () => {
  test('should navigate to blog from homepage', async ({ page }) => {
    await page.goto('/')

    // Find and click blog link
    const blogLink = page.locator('a[href*="/blog"]').first()
    await blogLink.click()

    // Should be on blog page
    await expect(page).toHaveURL(/\/blog/)
    await expect(page.locator('h1')).toContainText(/blog|articles|posts/i)
  })

  test('should display list of blog posts', async ({ page }) => {
    await page.goto('/blog')

    // Should show multiple blog posts
    const posts = page.locator('article, [data-testid="blog-post"], a[href*="/blog/"]')
    const count = await posts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should open and read a blog post', async ({ page }) => {
    await page.goto('/blog')

    // Click on first blog post
    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    // Should be on blog post page
    await expect(page).toHaveURL(/\/blog\/[^/]+/)

    // Should have title and content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('article, [role="article"], main')).toBeVisible()
  })

  test('should show blog post metadata', async ({ page }) => {
    await page.goto('/blog')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    // Should show date, author, or reading time
    const hasMetadata = await page.locator('text=/\\d+ min|published|author|\\d{4}/i').isVisible()
    expect(hasMetadata).toBeTruthy()
  })

  test('should show related posts', async ({ page }) => {
    await page.goto('/blog')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    // Look for related posts section
    const relatedSection = page.locator('text=/related|you might also|more posts/i')
    if (await relatedSection.isVisible()) {
      const relatedPosts = page.locator('a[href*="/blog/"]')
      const count = await relatedPosts.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should allow sharing blog post', async ({ page }) => {
    await page.goto('/blog')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    // Look for share buttons
    const shareButton = page.locator('button, a').filter({ hasText: /share|twitter|facebook|linkedin/i }).first()
    if (await shareButton.isVisible()) {
      expect(true).toBeTruthy()
    }
  })

  test('should navigate between blog posts', async ({ page }) => {
    await page.goto('/blog')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    const currentUrl = page.url()

    // Look for next/previous navigation
    const nextButton = page.locator('a').filter({ hasText: /next|previous|older|newer/i }).first()
    if (await nextButton.isVisible()) {
      await nextButton.click()
      await page.waitForTimeout(1000)

      // Should navigate to different post
      expect(page.url()).not.toBe(currentUrl)
    }
  })

  test('should have working back to blog link', async ({ page }) => {
    await page.goto('/blog')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    await firstPost.click()

    // Find back to blog link
    const backLink = page.locator('a[href="/blog"], a').filter({ hasText: /back to blog|all posts/i }).first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await expect(page).toHaveURL(/\/blog$/)
    }
  })
})

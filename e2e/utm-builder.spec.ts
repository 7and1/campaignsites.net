import { test, expect } from '@playwright/test'

test.describe('UTM Builder Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/utm-builder')
  })

  test('should load UTM builder page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/utm/i)
  })

  test('should generate UTM parameters', async ({ page }) => {
    // Fill in the form
    await page.fill('input[name="url"]', 'https://example.com')
    await page.fill('input[name="source"]', 'facebook')
    await page.fill('input[name="medium"]', 'social')
    await page.fill('input[name="campaign"]', 'spring-sale')

    // Check that the generated URL is displayed
    const generatedUrl = page.locator('text=/https:\\/\\/example\\.com.*utm_source=facebook/i')
    await expect(generatedUrl).toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields', async ({ page }) => {
    // Try to generate without filling required fields
    const generateButton = page.locator('button').filter({ hasText: /generate|create/i }).first()

    if (await generateButton.isVisible()) {
      await generateButton.click()
      // Should show validation errors
      await expect(page.locator('text=/required|fill/i')).toBeVisible({ timeout: 3000 })
    }
  })

  test('should copy generated URL to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Fill in the form
    await page.fill('input[name="url"]', 'https://example.com')
    await page.fill('input[name="source"]', 'twitter')
    await page.fill('input[name="medium"]', 'social')
    await page.fill('input[name="campaign"]', 'test-campaign')

    // Click copy button
    const copyButton = page.locator('button').filter({ hasText: /copy/i }).first()
    await copyButton.click()

    // Should show success message
    await expect(page.locator('text=/copied|success/i')).toBeVisible({ timeout: 3000 })
  })

  test('should handle optional parameters', async ({ page }) => {
    // Fill in required and optional fields
    await page.fill('input[name="url"]', 'https://example.com')
    await page.fill('input[name="source"]', 'newsletter')
    await page.fill('input[name="medium"]', 'email')
    await page.fill('input[name="campaign"]', 'weekly-digest')

    // Fill optional fields if they exist
    const termInput = page.locator('input[name="term"]')
    if (await termInput.isVisible()) {
      await termInput.fill('marketing')
    }

    const contentInput = page.locator('input[name="content"]')
    if (await contentInput.isVisible()) {
      await contentInput.fill('header-link')
    }

    // Check that the generated URL includes optional parameters
    const generatedUrl = page.locator('text=/utm_term=marketing/i')
    await expect(generatedUrl).toBeVisible({ timeout: 5000 })
  })

  test('should reset form', async ({ page }) => {
    // Fill in the form
    await page.fill('input[name="url"]', 'https://example.com')
    await page.fill('input[name="source"]', 'google')
    await page.fill('input[name="medium"]', 'cpc')

    // Click reset button if it exists
    const resetButton = page.locator('button').filter({ hasText: /reset|clear/i }).first()
    if (await resetButton.isVisible()) {
      await resetButton.click()

      // Check that fields are cleared
      await expect(page.locator('input[name="url"]')).toHaveValue('')
      await expect(page.locator('input[name="source"]')).toHaveValue('')
    }
  })
})

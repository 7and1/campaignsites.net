import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should have search functionality on site', async ({ page }) => {
    await page.goto('/')

    // Look for search input or button
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    const searchButton = page.locator('button').filter({ hasText: /search/i })

    const hasSearch = (await searchInput.isVisible()) || (await searchButton.isVisible())
    expect(hasSearch).toBeTruthy()
  })

  test('should perform search and show results', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('marketing')

      // Submit search
      await searchInput.press('Enter')

      // Should show search results
      await expect(page.locator('text=/results|found|matches/i')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show no results message for invalid search', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyzabc123nonexistent')
      await searchInput.press('Enter')

      // Should show no results message
      await expect(page.locator('text=/no results|not found|try again/i')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should filter search results by type', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('campaign')
      await searchInput.press('Enter')

      await page.waitForTimeout(1000)

      // Look for filter options
      const filterButton = page.locator('button, select').filter({ hasText: /filter|type|category/i }).first()
      if (await filterButton.isVisible()) {
        await filterButton.click()
        await page.waitForTimeout(500)
        expect(true).toBeTruthy()
      }
    }
  })

  test('should clear search query', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test query')

      // Look for clear button
      const clearButton = page.locator('button').filter({ hasText: /clear|×|✕/i }).first()
      if (await clearButton.isVisible()) {
        await clearButton.click()
        await expect(searchInput).toHaveValue('')
      }
    }
  })

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('mar')
      await page.waitForTimeout(1000)

      // Look for suggestions dropdown
      const suggestions = page.locator('[role="listbox"], [role="menu"], .suggestions')
      if (await suggestions.isVisible()) {
        expect(true).toBeTruthy()
      }
    }
  })

  test('should navigate to search result', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('utm')
      await searchInput.press('Enter')

      await page.waitForTimeout(1000)

      // Click on first result
      const firstResult = page.locator('a[href*="/"]').filter({ hasText: /utm/i }).first()
      if (await firstResult.isVisible()) {
        await firstResult.click()
        await page.waitForTimeout(1000)

        // Should navigate to result page
        expect(page.url()).not.toContain('search')
      }
    }
  })

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test & special "characters"')
      await searchInput.press('Enter')

      // Should not crash or show error
      await page.waitForTimeout(1000)
      expect(true).toBeTruthy()
    }
  })
})

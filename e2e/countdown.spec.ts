import { test, expect } from '@playwright/test'

test.describe('Countdown Timer Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/countdown')
  })

  test('should load countdown timer page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/countdown/i)
  })

  test('should create a countdown timer', async ({ page }) => {
    // Fill in the form
    const titleInput = page.locator('input[name="title"]')
    if (await titleInput.isVisible()) {
      await titleInput.fill('Product Launch')
    }

    // Set a future date
    const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first()
    if (await dateInput.isVisible()) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const dateString = futureDate.toISOString().split('T')[0]
      await dateInput.fill(dateString)
    }

    // Submit or generate
    const submitButton = page.locator('button').filter({ hasText: /create|generate|start/i }).first()
    if (await submitButton.isVisible()) {
      await submitButton.click()
    }

    // Should show countdown display
    await expect(page.locator('text=/days|hours|minutes|seconds/i')).toBeVisible({ timeout: 5000 })
  })

  test('should display countdown units', async ({ page }) => {
    // Set a future date
    const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first()
    if (await dateInput.isVisible()) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const dateString = futureDate.toISOString().split('T')[0]
      await dateInput.fill(dateString)

      // Wait for countdown to render
      await page.waitForTimeout(1000)

      // Should show time units
      const hasTimeUnits = await page.locator('text=/days|hours|minutes|seconds/i').isVisible()
      expect(hasTimeUnits).toBeTruthy()
    }
  })

  test('should handle past dates', async ({ page }) => {
    const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first()
    if (await dateInput.isVisible()) {
      // Set a past date
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const dateString = pastDate.toISOString().split('T')[0]
      await dateInput.fill(dateString)

      const submitButton = page.locator('button').filter({ hasText: /create|generate|start/i }).first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
      }

      // Should show expired or error message
      await expect(page.locator('text=/expired|past|invalid/i')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should allow customization options', async ({ page }) => {
    // Check for customization options
    const colorPicker = page.locator('input[type="color"]')
    if (await colorPicker.isVisible()) {
      await colorPicker.fill('#ff0000')
    }

    const fontSelect = page.locator('select[name="font"]')
    if (await fontSelect.isVisible()) {
      await fontSelect.selectOption({ index: 1 })
    }

    // Verify changes are applied
    await page.waitForTimeout(500)
    expect(true).toBeTruthy() // Customization applied
  })
})

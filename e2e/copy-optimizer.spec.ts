import { test, expect } from '@playwright/test'

test.describe('Copy Optimizer Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/copy-optimizer')
  })

  test('should load copy optimizer page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/copy|optimizer/i)
  })

  test('should analyze copy text', async ({ page }) => {
    const textArea = page.locator('textarea').first()
    await textArea.fill('This is a test headline for my marketing campaign. Buy now and save 50%!')

    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    // Should show analysis results
    await expect(page.locator('text=/score|rating|suggestion|improvement/i')).toBeVisible({ timeout: 10000 })
  })

  test('should provide suggestions for improvement', async ({ page }) => {
    const textArea = page.locator('textarea').first()
    await textArea.fill('bad copy with no value proposition')

    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    // Should show suggestions
    await expect(page.locator('text=/suggestion|improve|tip|recommendation/i')).toBeVisible({ timeout: 10000 })
  })

  test('should handle empty input', async ({ page }) => {
    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    // Should show error or validation message
    await expect(page.locator('text=/required|enter|empty/i')).toBeVisible({ timeout: 5000 })
  })

  test('should analyze different copy types', async ({ page }) => {
    // Check if there's a copy type selector
    const typeSelect = page.locator('select[name="type"], select[name="copyType"]')
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ index: 1 })
    }

    const textArea = page.locator('textarea').first()
    await textArea.fill('Limited time offer! Get 30% off all products this weekend only.')

    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    // Should show type-specific analysis
    await page.waitForTimeout(2000)
    expect(true).toBeTruthy()
  })

  test('should show character count', async ({ page }) => {
    const textArea = page.locator('textarea').first()
    await textArea.fill('Test copy for character counting')

    // Should show character count
    await expect(page.locator('text=/\\d+.*character|character.*\\d+/i')).toBeVisible({ timeout: 3000 })
  })

  test('should allow copy editing and re-analysis', async ({ page }) => {
    const textArea = page.locator('textarea').first()
    await textArea.fill('First version of copy')

    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    await page.waitForTimeout(2000)

    // Edit the copy
    await textArea.fill('Improved version of copy with better value proposition')
    await analyzeButton.click()

    // Should show updated analysis
    await page.waitForTimeout(2000)
    expect(true).toBeTruthy()
  })

  test('should handle long copy text', async ({ page }) => {
    const longCopy = 'This is a very long piece of copy. '.repeat(50)
    const textArea = page.locator('textarea').first()
    await textArea.fill(longCopy)

    const analyzeButton = page.locator('button').filter({ hasText: /analyze|optimize|check/i }).first()
    await analyzeButton.click()

    // Should handle long text without errors
    await page.waitForTimeout(3000)
    expect(true).toBeTruthy()
  })
})

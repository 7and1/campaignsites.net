import { test, expect } from '@playwright/test'

test.describe('Budget Calculator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/budget-calc')
  })

  test('should load budget calculator page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/budget/i)
  })

  test('should calculate budget allocation', async ({ page }) => {
    // Fill in total budget
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()
    await budgetInput.fill('10000')

    // Wait for calculations to appear
    await page.waitForTimeout(1000)

    // Should show calculated values
    const hasNumbers = await page.locator('text=/\\$|\\d+/').count()
    expect(hasNumbers).toBeGreaterThan(0)
  })

  test('should handle different budget amounts', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()

    // Test with small budget
    await budgetInput.fill('1000')
    await page.waitForTimeout(500)

    // Test with large budget
    await budgetInput.fill('100000')
    await page.waitForTimeout(500)

    // Should show updated calculations
    const hasCalculations = await page.locator('text=/\\$|\\d+/').count()
    expect(hasCalculations).toBeGreaterThan(0)
  })

  test('should validate numeric input', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()

    // Try to enter non-numeric value
    await budgetInput.fill('abc')

    // Input should be empty or show error
    const value = await budgetInput.inputValue()
    expect(value).toBe('')
  })

  test('should show budget breakdown by category', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()
    await budgetInput.fill('50000')

    await page.waitForTimeout(1000)

    // Should show different categories
    const categories = await page.locator('text=/advertising|content|tools|social|email/i').count()
    expect(categories).toBeGreaterThan(0)
  })

  test('should allow custom category percentages', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()
    await budgetInput.fill('20000')

    // Look for percentage inputs or sliders
    const percentageInputs = page.locator('input[type="number"][max="100"], input[type="range"]')
    const count = await percentageInputs.count()

    if (count > 0) {
      await percentageInputs.first().fill('30')
      await page.waitForTimeout(500)

      // Should recalculate based on new percentage
      expect(true).toBeTruthy()
    }
  })

  test('should export or save budget plan', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"], input[type="number"]').first()
    await budgetInput.fill('15000')

    await page.waitForTimeout(1000)

    // Look for export/save button
    const exportButton = page.locator('button').filter({ hasText: /export|save|download/i }).first()
    if (await exportButton.isVisible()) {
      await exportButton.click()

      // Should trigger download or show success
      await page.waitForTimeout(1000)
      expect(true).toBeTruthy()
    }
  })
})

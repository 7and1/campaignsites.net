import { test, expect } from '@playwright/test'

test.describe('Newsletter Subscription', () => {
  test('should successfully subscribe to newsletter', async ({ page }) => {
    await page.goto('/')

    // Find and fill the newsletter form
    const emailInput = page.locator('input[type="email"][name="email"]').first()
    await emailInput.fill('test@example.com')

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /subscribe/i }).first()
    await submitButton.click()

    // Wait for success message
    await expect(page.locator('text=/subscribed|success|thank you/i')).toBeVisible({ timeout: 10000 })
  })

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/')

    const emailInput = page.locator('input[type="email"][name="email"]').first()
    await emailInput.fill('invalid-email')

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /subscribe/i }).first()
    await submitButton.click()

    // Should show validation error
    await expect(page.locator('text=/invalid|error/i')).toBeVisible({ timeout: 5000 })
  })

  test('should show error for duplicate subscription', async ({ page }) => {
    await page.goto('/')

    const emailInput = page.locator('input[type="email"][name="email"]').first()
    await emailInput.fill('duplicate@example.com')

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /subscribe/i }).first()

    // First subscription
    await submitButton.click()
    await page.waitForTimeout(2000)

    // Try to subscribe again with same email
    await emailInput.fill('duplicate@example.com')
    await submitButton.click()

    // Should show already subscribed message
    await expect(page.locator('text=/already|subscribed/i')).toBeVisible({ timeout: 5000 })
  })

  test('should not submit empty email', async ({ page }) => {
    await page.goto('/')

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /subscribe/i }).first()
    await submitButton.click()

    // Form should not submit or show error
    const emailInput = page.locator('input[type="email"][name="email"]').first()
    await expect(emailInput).toHaveAttribute('required', '')
  })
})

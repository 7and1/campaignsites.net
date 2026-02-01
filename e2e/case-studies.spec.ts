import { test, expect } from '@playwright/test'

test.describe('Case Study Viewing', () => {
  test('should navigate to case studies from homepage', async ({ page }) => {
    await page.goto('/')

    // Find and click case studies link
    const caseStudiesLink = page.locator('a[href*="/gallery"], a').filter({ hasText: /case studies|gallery|work/i }).first()
    if (await caseStudiesLink.isVisible()) {
      await caseStudiesLink.click()
      await expect(page).toHaveURL(/\/gallery/)
    }
  })

  test('should display list of case studies', async ({ page }) => {
    await page.goto('/gallery')

    // Should show case studies
    const caseStudies = page.locator('article, [data-testid="case-study"], a[href*="/gallery/"]')
    const count = await caseStudies.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should open and view a case study', async ({ page }) => {
    await page.goto('/gallery')

    // Click on first case study
    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Should be on case study page
    await expect(page).toHaveURL(/\/gallery\/[^/]+/)

    // Should have title and content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('article, [role="article"], main')).toBeVisible()
  })

  test('should show case study details', async ({ page }) => {
    await page.goto('/gallery')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Should show client, industry, or results
    const hasDetails = await page.locator('text=/client|industry|results|challenge|solution/i').isVisible()
    expect(hasDetails).toBeTruthy()
  })

  test('should display case study images', async ({ page }) => {
    await page.goto('/gallery')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Should have images
    const images = page.locator('img')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show related case studies', async ({ page }) => {
    await page.goto('/gallery')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Look for related case studies section
    const relatedSection = page.locator('text=/related|similar|more case studies/i')
    if (await relatedSection.isVisible()) {
      const relatedStudies = page.locator('a[href*="/gallery/"]')
      const count = await relatedStudies.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should have working back to gallery link', async ({ page }) => {
    await page.goto('/gallery')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Find back to gallery link
    const backLink = page.locator('a[href="/gallery"], a').filter({ hasText: /back to gallery|all case studies/i }).first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await expect(page).toHaveURL(/\/gallery$/)
    }
  })

  test('should show metrics or results', async ({ page }) => {
    await page.goto('/gallery')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    await firstCaseStudy.click()

    // Look for metrics or results
    const hasMetrics = await page.locator('text=/\\d+%|increase|decrease|improvement|roi/i').isVisible()
    expect(hasMetrics).toBeTruthy()
  })
})

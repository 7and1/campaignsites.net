import { test, expect } from '@playwright/test'

test.describe('Visual Regression - Homepage', () => {
  test('homepage desktop view', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('homepage mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('homepage tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})

test.describe('Visual Regression - Tools', () => {
  test('tools index page', async ({ page }) => {
    await page.goto('/tools')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('tools-index.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('UTM builder tool', async ({ page }) => {
    await page.goto('/tools/utm-builder')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('utm-builder.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('budget calculator tool', async ({ page }) => {
    await page.goto('/tools/budget-calc')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('budget-calc.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('countdown timer tool', async ({ page }) => {
    await page.goto('/tools/countdown')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('countdown.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('copy optimizer tool', async ({ page }) => {
    await page.goto('/tools/copy-optimizer')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('copy-optimizer.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})

test.describe('Visual Regression - Blog', () => {
  test('blog index page', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('blog-index.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('blog post page', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const firstPost = page.locator('article a, a[href*="/blog/"]').first()
    if (await firstPost.isVisible()) {
      await firstPost.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot('blog-post.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    }
  })
})

test.describe('Visual Regression - Gallery', () => {
  test('gallery index page', async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('gallery-index.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('case study page', async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('networkidle')

    const firstCaseStudy = page.locator('article a, a[href*="/gallery/"]').first()
    if (await firstCaseStudy.isVisible()) {
      await firstCaseStudy.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot('case-study.png', {
        fullPage: true,
        maxDiffPixels: 100,
      })
    }
  })
})

test.describe('Visual Regression - Responsive', () => {
  const viewports = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'desktop-large', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`homepage at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
        fullPage: false,
        maxDiffPixels: 100,
      })
    })
  }
})

test.describe('Visual Regression - Dark Mode', () => {
  test('homepage in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('tools page in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/tools')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('tools-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})

test.describe('Visual Regression - Interactive States', () => {
  test('button hover states', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const button = page.locator('button, a.button').first()
    if (await button.isVisible()) {
      await button.hover()
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot('button-hover.png', {
        maxDiffPixels: 50,
      })
    }
  })

  test('form focus states', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const input = page.locator('input[type="email"]').first()
    if (await input.isVisible()) {
      await input.focus()
      await page.waitForTimeout(300)
      await expect(page).toHaveScreenshot('form-focus.png', {
        maxDiffPixels: 50,
      })
    }
  })
})

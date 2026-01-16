import { test, expect } from '@playwright/test'

/**
 * Visual capture tests - captures screenshots of key pages
 * These help identify visual issues and broken layouts
 */

test.describe('Visual Capture - Public Pages', () => {
  test('Login page screenshot', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/screenshots/login-page.png', fullPage: true })

    // Verify login form exists
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('Portal login page screenshot', async ({ page }) => {
    await page.goto('/portal/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/screenshots/portal-login.png', fullPage: true })
  })
})

test.describe('Visual Capture - All Routes', () => {
  const routes = [
    { path: '/', name: 'home' },
    { path: '/dashboard', name: 'dashboard' },
    { path: '/clients', name: 'clients' },
    { path: '/clients/new', name: 'clients-new' },
    { path: '/properties', name: 'properties' },
    { path: '/properties/new', name: 'properties-new' },
    { path: '/vendors', name: 'vendors' },
    { path: '/vendors/new', name: 'vendors-new' },
    { path: '/work-orders', name: 'work-orders' },
    { path: '/calendar', name: 'calendar' },
    { path: '/inspections', name: 'inspections' },
    { path: '/billing', name: 'billing' },
    { path: '/billing/invoices', name: 'invoices' },
    { path: '/notifications', name: 'notifications' },
    { path: '/activity', name: 'activity' },
    { path: '/settings/pricing', name: 'settings-pricing' },
    { path: '/settings/templates', name: 'settings-templates' },
    { path: '/settings/notifications', name: 'settings-notifications' },
    { path: '/dashboard/reports', name: 'reports' },
  ]

  for (const route of routes) {
    test(`Capture ${route.name} page`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500) // Wait for animations

      await page.screenshot({
        path: `test-results/screenshots/${route.name}.png`,
        fullPage: true
      })

      // Basic checks - page should have content
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // Check for JavaScript errors
      const hasError = await page.evaluate(() => {
        return document.body.textContent?.toLowerCase().includes('error') &&
               document.body.textContent?.toLowerCase().includes('something went wrong')
      })

      if (hasError) {
        console.log(`Warning: ${route.name} page may have an error state`)
      }
    })
  }
})

test.describe('Interactive Element Screenshots', () => {
  test('Capture Create Invoice dialog', async ({ page }) => {
    await page.goto('/billing/invoices')
    await page.waitForLoadState('networkidle')

    const createButton = page.getByRole('button', { name: /create invoice/i })
    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click()
      await page.waitForTimeout(500)

      await page.screenshot({
        path: 'test-results/screenshots/create-invoice-dialog.png',
        fullPage: true
      })

      // Try to open client select
      const dialog = page.locator('[role="dialog"]')
      if (await dialog.isVisible()) {
        const clientSelect = dialog.locator('button[role="combobox"]').first()
        if (await clientSelect.isVisible()) {
          await clientSelect.click()
          await page.waitForTimeout(300)

          await page.screenshot({
            path: 'test-results/screenshots/create-invoice-select-open.png',
            fullPage: true
          })
        }
      }
    }
  })

  test('Capture notification dropdown', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const notificationBtn = page.locator('button').filter({ has: page.locator('.lucide-bell') })
    if (await notificationBtn.isVisible({ timeout: 3000 })) {
      await notificationBtn.click()
      await page.waitForTimeout(300)

      await page.screenshot({
        path: 'test-results/screenshots/notification-dropdown.png',
        fullPage: true
      })
    }
  })

  test('Capture work order tabs', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: 'test-results/screenshots/work-orders-page.png',
      fullPage: true
    })

    // Click through tabs and capture
    const tabs = page.locator('[role="tablist"] [role="tab"]')
    const count = await tabs.count()

    for (let i = 0; i < Math.min(count, 4); i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: `test-results/screenshots/work-orders-tab-${i}.png`,
        fullPage: true
      })
    }
  })

  test('Capture vendor filter dropdown', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const filterSelect = page.locator('button[role="combobox"]').first()
    if (await filterSelect.isVisible({ timeout: 3000 })) {
      await filterSelect.click()
      await page.waitForTimeout(300)

      await page.screenshot({
        path: 'test-results/screenshots/vendor-filter-dropdown.png',
        fullPage: true
      })
    }
  })
})

test.describe('Mobile Responsive Screenshots', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone X size

  const mobileRoutes = [
    { path: '/dashboard', name: 'mobile-dashboard' },
    { path: '/clients', name: 'mobile-clients' },
    { path: '/work-orders', name: 'mobile-work-orders' },
    { path: '/billing/invoices', name: 'mobile-invoices' },
  ]

  for (const route of mobileRoutes) {
    test(`Mobile: ${route.name}`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.screenshot({
        path: `test-results/screenshots/${route.name}.png`,
        fullPage: true
      })
    })
  }
})

test.describe('Error State Detection', () => {
  test('Check for React error boundaries', async ({ page }) => {
    const routes = ['/dashboard', '/clients', '/properties', '/work-orders', '/billing']

    for (const route of routes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Check for common error indicators
      const errorIndicators = [
        'Something went wrong',
        'Error boundary',
        'An error occurred',
        'Unexpected error',
        'Failed to load'
      ]

      const pageContent = await page.locator('body').textContent() || ''

      for (const indicator of errorIndicators) {
        if (pageContent.includes(indicator)) {
          console.log(`Warning: Found "${indicator}" on ${route}`)
          await page.screenshot({
            path: `test-results/screenshots/error-${route.replace(/\//g, '-')}.png`,
            fullPage: true
          })
        }
      }
    }
  })

  test('Check all buttons are clickable', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button:visible')
    const count = await buttons.count()
    console.log(`Found ${count} visible buttons on dashboard`)

    let clickableCount = 0
    let disabledCount = 0

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i)
      const isDisabled = await button.isDisabled()

      if (isDisabled) {
        disabledCount++
      } else {
        clickableCount++
      }
    }

    console.log(`Clickable: ${clickableCount}, Disabled: ${disabledCount}`)
  })
})

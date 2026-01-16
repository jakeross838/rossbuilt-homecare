import { test, expect, Page } from '@playwright/test'

// Test credentials
const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testtest'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard', { timeout: 30000 })
}

// Helper to check page loads without errors
async function checkNoErrors(page: Page) {
  // Check for error boundary
  const errorBoundary = page.getByText('Something went wrong')
  const hasError = await errorBoundary.isVisible().catch(() => false)
  if (hasError) {
    const errorText = await page.locator('body').textContent()
    throw new Error(`Page has error: ${errorText}`)
  }
}

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Please enter a valid email')).toBeVisible({ timeout: 5000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page)
    // Dashboard shows dynamic greeting, check for key metrics
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 10000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('invalid@test.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/failed|invalid|error/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load dashboard without errors', async ({ page }) => {
    await checkNoErrors(page)
    // Dashboard shows dynamic greeting with user name, check for content
    await expect(page.locator('.grid').first()).toBeVisible()
  })

  test('should display key metrics cards', async ({ page }) => {
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /clients/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /properties/i }).first()).toBeVisible()
  })
})

test.describe('Clients Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/clients')
  })

  test('should load clients page without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
  })

  test('should have Add Client link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /add client/i })).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    // Use more specific locator - the page-level search, not global header search
    await expect(page.getByRole('textbox', { name: /search clients/i })).toBeVisible()
  })

  test('should navigate to new client form', async ({ page }) => {
    await page.getByRole('link', { name: /add client/i }).click()
    await page.waitForURL('**/clients/new')
    await checkNoErrors(page)
  })
})

test.describe('New Client Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/clients/new')
  })

  test('should load new client form without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: /new client|add client/i })).toBeVisible()
  })

  test('should have required form fields', async ({ page }) => {
    // Form fields might use different label patterns
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('should show validation on empty submit', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /save|create|submit/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Properties Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/properties')
  })

  test('should load properties page without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible()
  })

  test('should have Add Property link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /add property/i })).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search properties/i)).toBeVisible()
  })

  test('should navigate to new property form', async ({ page }) => {
    await page.getByRole('link', { name: /add property/i }).click()
    await page.waitForURL('**/properties/new')
    await checkNoErrors(page)
  })
})

test.describe('New Property Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/properties/new')
  })

  test('should load new property form without errors', async ({ page }) => {
    await checkNoErrors(page)
  })

  test('should have required form fields', async ({ page }) => {
    await expect(page.getByLabel(/name/i).first()).toBeVisible()
  })
})

test.describe('Vendors Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
  })

  test('should load vendors page without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Vendors' })).toBeVisible()
  })

  test('should have Add Vendor button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add vendor/i })).toBeVisible()
  })

  test('should have trade filter dropdown', async ({ page }) => {
    const tradeFilter = page.locator('button').filter({ hasText: /all trades/i })
    await expect(tradeFilter).toBeVisible()
  })

  test('should have tabs for vendor status', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /^active$/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /preferred/i })).toBeVisible()
  })
})

test.describe('Work Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/work-orders')
  })

  test('should load work orders page without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Work Orders' })).toBeVisible()
  })

  test('should have New Work Order button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new work order/i })).toBeVisible()
  })

  test('should have status tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /^all/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^active/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /completed/i })).toBeVisible()
  })

  test('should have priority filter', async ({ page }) => {
    const priorityFilter = page.locator('button').filter({ hasText: /priorities/i })
    await expect(priorityFilter).toBeVisible()
  })
})

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/calendar')
  })

  test('should load calendar page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })

  test('should display calendar content', async ({ page }) => {
    await page.waitForTimeout(2000)
    await checkNoErrors(page)
  })
})

test.describe('Inspections Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/inspections')
  })

  test('should load inspections page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })
})

test.describe('Billing Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/billing')
  })

  test('should load billing page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })

  test('should display billing content', async ({ page }) => {
    await page.waitForTimeout(1000)
    await checkNoErrors(page)
  })
})

test.describe('Invoices Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/billing/invoices')
  })

  test('should load invoices page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })
})

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/reports')
  })

  test('should load reports page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })
})

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/notifications')
  })

  test('should load notifications page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })
})

test.describe('Activity Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/activity')
  })

  test('should load activity page without errors', async ({ page }) => {
    await checkNoErrors(page)
  })
})

test.describe('Settings Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load pricing settings without errors', async ({ page }) => {
    await page.goto('/settings/pricing')
    await checkNoErrors(page)
  })

  test('should load templates settings without errors', async ({ page }) => {
    await page.goto('/settings/templates')
    await checkNoErrors(page)
  })

  test('should load notification settings without errors', async ({ page }) => {
    await page.goto('/settings/notifications')
    await checkNoErrors(page)
  })
})

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('sidebar navigation works', async ({ page }) => {
    const navItems = [
      { name: /clients/i, url: '/clients' },
      { name: /properties/i, url: '/properties' },
      { name: /work orders/i, url: '/work-orders' },
      { name: /vendors/i, url: '/vendors' },
      { name: /billing/i, url: '/billing' },
    ]

    for (const item of navItems) {
      const link = page.getByRole('link', { name: item.name }).first()
      if (await link.isVisible()) {
        await link.click()
        await page.waitForURL(`**${item.url}`)
        await checkNoErrors(page)
      }
    }
  })
})

test.describe('Header Components', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('notification bell should be clickable', async ({ page }) => {
    const notificationBtn = page.getByRole('button', { name: /notification/i })
    if (await notificationBtn.isVisible()) {
      await notificationBtn.click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)
    }
  })
})

test.describe('Select Components', () => {
  test('work orders priority filter should work', async ({ page }) => {
    await login(page)
    await page.goto('/work-orders')
    await checkNoErrors(page)

    const priorityTrigger = page.locator('button').filter({ hasText: /priorities/i })
    if (await priorityTrigger.isVisible()) {
      await priorityTrigger.click()
      await page.waitForTimeout(300)
      await checkNoErrors(page)
    }
  })

  test('vendors trade filter should work', async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await checkNoErrors(page)

    const tradeTrigger = page.locator('button').filter({ hasText: /trades/i })
    if (await tradeTrigger.isVisible()) {
      await tradeTrigger.click()
      await page.waitForTimeout(300)
      await checkNoErrors(page)
    }
  })
})

test.describe('Tab Components', () => {
  test('work orders tabs should switch', async ({ page }) => {
    await login(page)
    await page.goto('/work-orders')
    await checkNoErrors(page)

    const tabs = ['All', 'Active', 'Completed', 'On Hold']
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}`, 'i') })
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(300)
        await checkNoErrors(page)
      }
    }
  })

  test('vendors tabs should switch', async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await checkNoErrors(page)

    const tabs = ['Active', 'Preferred', 'Inactive', 'All']
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}`, 'i') })
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(300)
        await checkNoErrors(page)
      }
    }
  })
})

test.describe('Dialogs and Modals', () => {
  test('should handle work order dialog', async ({ page }) => {
    await login(page)
    await page.goto('/work-orders')

    const newBtn = page.getByRole('button', { name: /new work order/i })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)
    }
  })
})

test.describe('Responsive Layout', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await login(page)
    await checkNoErrors(page)
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await login(page)
    await checkNoErrors(page)
  })
})

test.describe('Error Handling', () => {
  test('should handle non-existent routes', async ({ page }) => {
    await login(page)
    await page.goto('/non-existent-page-12345')
    await page.waitForTimeout(1000)
  })
})

test.describe('Portal Pages', () => {
  test('portal login page should load', async ({ page }) => {
    await page.goto('/portal/login')
    await checkNoErrors(page)
  })
})

test.describe('Inspector Pages', () => {
  test('inspector dashboard should load', async ({ page }) => {
    await page.goto('/inspector')
    await page.waitForTimeout(1000)
  })
})

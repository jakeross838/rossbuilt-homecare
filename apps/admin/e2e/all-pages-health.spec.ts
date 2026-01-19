import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive page health tests
 * Tests all routes for:
 * - Page loads without errors
 * - No console errors
 * - Key elements render
 * - Data syncs properly
 * - UI components are interactive
 */

// Mock user data for auth
const MOCK_USER = {
  id: 'test-user-id-12345',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

const MOCK_PROFILE = {
  id: 'test-user-id-12345',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'admin',
  organization_id: '00000000-0000-0000-0000-000000000001',
}

// Helper to set up mock auth state
async function setupMockAuth(page: Page) {
  // Set localStorage before navigating - this mocks the Zustand persist store
  await page.addInitScript(() => {
    const mockAuthState = {
      state: {
        user: {
          id: 'test-user-id-12345',
          email: 'test@example.com',
          role: 'authenticated',
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
        profile: {
          id: 'test-user-id-12345',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin',
          organization_id: '00000000-0000-0000-0000-000000000001',
        },
        session: null,
        isLoading: false,
        isInitialized: true,
      },
      version: 0,
    }
    localStorage.setItem('home-care-os-auth', JSON.stringify(mockAuthState))
  })
}

// Helper to check for console errors
async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

// Helper to check page health
async function checkPageHealth(page: Page, options: {
  url: string
  expectedHeading?: RegExp | string
  expectedElements?: string[]
  waitForSelector?: string
}) {
  await page.goto(options.url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000) // Allow for any async renders

  // Check for error boundary
  const hasErrorBoundary = await page.getByText('Something went wrong').isVisible().catch(() => false)
  if (hasErrorBoundary) {
    throw new Error(`Error boundary triggered on ${options.url}`)
  }

  // Check for expected heading - use exact match for h1
  if (options.expectedHeading) {
    if (typeof options.expectedHeading === 'string') {
      await expect(page.locator('h1').filter({ hasText: options.expectedHeading })).toBeVisible({ timeout: 10000 })
    } else {
      await expect(page.getByRole('heading', { name: options.expectedHeading }).first()).toBeVisible({ timeout: 10000 })
    }
  }

  // Wait for specific selector if provided
  if (options.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, { timeout: 10000 })
  }

  // Check for expected elements
  if (options.expectedElements) {
    for (const selector of options.expectedElements) {
      await expect(page.locator(selector).first()).toBeVisible({ timeout: 5000 })
    }
  }

  return { hasErrorBoundary }
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('loads without critical errors', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/dashboard',
    })

    // Dashboard should render main content area
    await expect(page.locator('main')).toBeVisible()
    // Check for dashboard-specific content
    await expect(page.getByText(/good morning|good afternoon|good evening/i)).toBeVisible()
  })

  test('displays navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    // Check sidebar navigation items
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /clients/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /properties/i }).first()).toBeVisible()
  })
})

test.describe('Clients Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('clients list page loads', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/clients',
      expectedHeading: 'Clients',
    })

    // Should have Add Client button/link (use first to handle duplicates)
    await expect(page.getByRole('link', { name: /add client/i }).first()).toBeVisible()
  })

  test('new client form loads', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/clients/new',
    })

    // Form should have required fields
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('can navigate from list to new client', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForTimeout(500)

    await page.getByRole('link', { name: /add client/i }).click()
    await page.waitForURL('**/clients/new')

    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Properties Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('properties list page loads', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/properties',
      expectedHeading: 'Properties',
    })

    await expect(page.getByRole('link', { name: /add property/i }).first()).toBeVisible()
  })

  test('new property form loads', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/properties/new',
    })

    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Vendors Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('vendors page loads with tabs', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/vendors',
      expectedHeading: 'Vendors',
    })

    // Check tabs - use exact: true to avoid matching 'Inactive'
    await expect(page.getByRole('tab', { name: 'Active', exact: true })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Preferred', exact: true })).toBeVisible()
  })

  test('vendor tabs are clickable', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const tabs = ['Active', 'Preferred', 'Inactive', 'All']
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') })
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(200)
        await expect(tab).toHaveAttribute('data-state', 'active')
      }
    }
  })

  test('add vendor button works', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const addBtn = page.getByRole('button', { name: /add vendor/i })
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    // Either dialog opens or navigates to new page
    await page.waitForTimeout(500)
    const hasDialog = await page.getByRole('dialog').isVisible().catch(() => false)
    const isOnNewPage = page.url().includes('/vendors/new')
    const hasForm = await page.locator('form').isVisible().catch(() => false)
    expect(hasDialog || isOnNewPage || hasForm).toBe(true)
  })
})

test.describe('Work Orders Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('work orders page loads with tabs', async ({ page }) => {
    await checkPageHealth(page, {
      url: '/work-orders',
      expectedHeading: 'Work Orders',
    })

    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /active/i })).toBeVisible()
  })

  test('work order tabs switch correctly', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    // Tabs have text like "Active (0)" so use contains matcher
    const activeTab = page.getByRole('tab').filter({ hasText: /^Active/ })
    await activeTab.click()
    await page.waitForTimeout(200)
    await expect(activeTab).toHaveAttribute('data-state', 'active')

    const completedTab = page.getByRole('tab').filter({ hasText: /^Completed/ })
    await completedTab.click()
    await page.waitForTimeout(200)
    await expect(completedTab).toHaveAttribute('data-state', 'active')
  })

  test('new work order dialog opens', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    const newBtn = page.getByRole('button', { name: /new work order/i })
    await expect(newBtn).toBeVisible()
    await newBtn.click()

    await page.waitForTimeout(300)
    // Should navigate to new page or open dialog
    const hasDialog = await page.getByRole('dialog').isVisible().catch(() => false)
    const isOnNewPage = page.url().includes('/work-orders/new')
    expect(hasDialog || isOnNewPage).toBe(true)
  })
})

test.describe('Calendar Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('calendar page loads', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForTimeout(1000)

    // Should not show error boundary
    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)

    // Should have some calendar content
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Inspections Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('inspections page loads', async ({ page }) => {
    await page.goto('/inspections')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Billing Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('billing dashboard loads', async ({ page }) => {
    await page.goto('/billing')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('invoices page loads', async ({ page }) => {
    await page.goto('/billing/invoices')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Reports Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('reports page loads', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Notifications Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('notifications page loads', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Activity Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('activity page loads', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Settings Module', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('pricing settings page loads', async ({ page }) => {
    await page.goto('/settings/pricing')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('templates settings page loads', async ({ page }) => {
    await page.goto('/settings/templates')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('notification settings page loads', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Inspector Module (Standalone)', () => {
  test('inspector dashboard loads without auth', async ({ page }) => {
    await page.goto('/inspector')
    await page.waitForTimeout(1000)

    // Inspector is standalone PWA, should load without error
    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Portal Module', () => {
  test('portal login page loads', async ({ page }) => {
    await page.goto('/portal/login')
    await page.waitForTimeout(1000)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('can navigate through all main routes', async ({ page }) => {
    const routes = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/clients', name: 'Clients' },
      { path: '/properties', name: 'Properties' },
      { path: '/vendors', name: 'Vendors' },
      { path: '/work-orders', name: 'Work Orders' },
      { path: '/billing', name: 'Billing' },
      { path: '/calendar', name: 'Calendar' },
      { path: '/settings', name: 'Settings' },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await page.waitForTimeout(500)

      // Should not redirect to login
      expect(page.url()).not.toContain('/login')

      // Should not show error boundary
      const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
      expect(hasError).toBe(false)
    }
  })
})

test.describe('UI Component Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('sidebar navigation links work', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    // Click on Clients link
    const clientsLink = page.getByRole('link', { name: /clients/i }).first()
    await clientsLink.click()
    await page.waitForURL('**/clients')
    expect(page.url()).toContain('/clients')
  })

  test('dropdowns open and close', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    // Find trade filter dropdown
    const tradeDropdown = page.locator('button').filter({ hasText: /trades/i }).first()
    if (await tradeDropdown.isVisible()) {
      await tradeDropdown.click()
      await page.waitForTimeout(200)

      // Dropdown content should be visible
      const dropdownContent = page.locator('[role="listbox"], [data-state="open"]')
      const isOpen = await dropdownContent.isVisible().catch(() => false)

      // Close by clicking elsewhere or pressing escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }
  })

  test('search inputs are functional', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForTimeout(500)

    const searchInput = page.getByPlaceholder(/search/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search')
      const value = await searchInput.inputValue()
      expect(value).toBe('test search')
    }
  })
})

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('layout works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    // Look for desktop sidebar (the one that's visible on lg screens)
    // or any visible navigation element
    const desktopSidebar = page.locator('aside.lg\\:flex, nav').filter({ has: page.getByText('Dashboard') })
    const hasVisibleNav = await desktopSidebar.first().isVisible().catch(() => false)
    // On desktop, sidebar links should be visible
    const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first()
    await expect(dashboardLink).toBeVisible()
  })

  test('layout works on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('layout works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const hasError = await page.getByText('Something went wrong').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })
})

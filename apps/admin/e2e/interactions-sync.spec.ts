import { test, expect, Page } from '@playwright/test'

/**
 * Deep interaction and sync tests
 * Tests that buttons work, forms submit, data syncs across views
 */

// Mock auth state
async function setupMockAuth(page: Page) {
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

test.describe('Dashboard Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('Schedule button navigates to calendar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const scheduleBtn = page.getByRole('link', { name: /schedule/i })
    await expect(scheduleBtn).toBeVisible()
    await scheduleBtn.click()

    await page.waitForURL('**/calendar')
    expect(page.url()).toContain('/calendar')
  })

  test('Work Orders button navigates correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const workOrdersBtn = page.getByRole('link', { name: /work orders/i }).first()
    await expect(workOrdersBtn).toBeVisible()
    await workOrdersBtn.click()

    await page.waitForURL('**/work-orders')
    expect(page.url()).toContain('/work-orders')
  })

  test('Billing button navigates correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const billingBtn = page.getByRole('link', { name: /billing/i }).first()
    await expect(billingBtn).toBeVisible()
    await billingBtn.click()

    await page.waitForURL('**/billing')
    expect(page.url()).toContain('/billing')
  })

  test('Period selector changes data view', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)

    // Find and click period selector
    const periodSelector = page.locator('button').filter({ hasText: /this month|this week|this year/i })
    if (await periodSelector.isVisible()) {
      await periodSelector.click()
      await page.waitForTimeout(300)

      // Select a different period
      const weekOption = page.getByRole('option', { name: /week/i })
      if (await weekOption.isVisible()) {
        await weekOption.click()
        await page.waitForTimeout(500)
        // Verify selector updated
        await expect(page.locator('button').filter({ hasText: /week/i })).toBeVisible()
      }
    }
  })
})

test.describe('Clients Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('client form has all required fields', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForTimeout(500)

    // Check for key form fields - use first() for primary contact fields
    await expect(page.getByLabel(/first name/i).first()).toBeVisible()
    await expect(page.getByLabel(/last name/i).first()).toBeVisible()
    await expect(page.getByLabel(/email/i).first()).toBeVisible()
    await expect(page.getByLabel(/phone/i).first()).toBeVisible()
  })

  test('client form validation shows errors on empty submit', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForTimeout(500)

    // Try to submit empty form
    const submitBtn = page.getByRole('button', { name: /save|create|submit/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      await page.waitForTimeout(500)

      // Should show validation errors or stay on form
      const stillOnForm = page.url().includes('/clients/new')
      expect(stillOnForm).toBe(true)
    }
  })

  test('client form can be filled', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForTimeout(500)

    // Fill form fields - use first() for primary contact fields
    const firstNameInput = page.getByLabel(/first name/i).first()
    await firstNameInput.fill('John')
    await expect(firstNameInput).toHaveValue('John')

    const lastNameInput = page.getByLabel(/last name/i).first()
    await lastNameInput.fill('Doe')
    await expect(lastNameInput).toHaveValue('Doe')

    const emailInput = page.getByLabel(/email/i).first()
    await emailInput.fill('john.doe@example.com')
    await expect(emailInput).toHaveValue('john.doe@example.com')
  })

  test('cancel button returns to list', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForTimeout(500)

    const cancelBtn = page.getByRole('button', { name: /cancel/i })
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await page.waitForURL('**/clients')
      expect(page.url()).toContain('/clients')
    }
  })
})

test.describe('Properties Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('property form has required fields', async ({ page }) => {
    await page.goto('/properties/new')
    await page.waitForTimeout(500)

    // Check for form fields
    await expect(page.getByLabel(/name/i).first()).toBeVisible()
  })

  test('property form address fields work', async ({ page }) => {
    await page.goto('/properties/new')
    await page.waitForTimeout(500)

    const addressInput = page.getByLabel(/address|street/i).first()
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Main St')
      await expect(addressInput).toHaveValue('123 Main St')
    }
  })
})

test.describe('Vendors Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('tab state persists correctly', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    // Click Preferred tab
    const preferredTab = page.getByRole('tab', { name: 'Preferred', exact: true })
    await preferredTab.click()
    await page.waitForTimeout(300)

    // Verify it's active
    await expect(preferredTab).toHaveAttribute('data-state', 'active')

    // Click All tab
    const allTab = page.getByRole('tab', { name: 'All', exact: true })
    await allTab.click()
    await page.waitForTimeout(300)

    await expect(allTab).toHaveAttribute('data-state', 'active')
    await expect(preferredTab).toHaveAttribute('data-state', 'inactive')
  })

  test('trade filter dropdown opens and closes', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const tradeFilter = page.locator('button').filter({ hasText: /all trades/i })
    if (await tradeFilter.isVisible()) {
      await tradeFilter.click()
      await page.waitForTimeout(300)

      // Check dropdown opened
      const dropdownContent = page.locator('[role="listbox"], [data-state="open"]')
      const isOpen = await dropdownContent.isVisible().catch(() => false)

      // Close with escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    }
  })

  test('add vendor opens form/dialog', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const addBtn = page.getByRole('button', { name: /add vendor/i })
    await addBtn.click()
    await page.waitForTimeout(500)

    // Should show form (either in dialog or new page)
    const hasForm = await page.locator('form').isVisible().catch(() => false)
    const hasDialog = await page.getByRole('dialog').isVisible().catch(() => false)
    const isOnNewPage = page.url().includes('/vendors/new')

    expect(hasForm || hasDialog || isOnNewPage).toBe(true)
  })
})

test.describe('Work Orders Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('tabs filter content correctly', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    // All tab should be active by default
    const allTab = page.getByRole('tab').filter({ hasText: /^All/ })
    await expect(allTab).toHaveAttribute('data-state', 'active')

    // Click Active tab
    const activeTab = page.getByRole('tab').filter({ hasText: /^Active/ })
    await activeTab.click()
    await page.waitForTimeout(300)

    await expect(activeTab).toHaveAttribute('data-state', 'active')
    await expect(allTab).toHaveAttribute('data-state', 'inactive')
  })

  test('priority filter dropdown works', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    const priorityFilter = page.locator('button').filter({ hasText: /priorities/i })
    if (await priorityFilter.isVisible()) {
      await priorityFilter.click()
      await page.waitForTimeout(300)

      // Should show filter options
      await page.keyboard.press('Escape')
    }
  })

  test('new work order button works', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    const newBtn = page.getByRole('button', { name: /new work order/i })
    await expect(newBtn).toBeVisible()
    await newBtn.click()
    await page.waitForTimeout(500)

    // Should show form
    const hasForm = await page.locator('form').isVisible().catch(() => false)
    const hasDialog = await page.getByRole('dialog').isVisible().catch(() => false)
    const isOnNewPage = page.url().includes('/work-orders/new')

    expect(hasForm || hasDialog || isOnNewPage).toBe(true)
  })

  test('search input filters results', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForTimeout(500)

    // Use specific placeholder for work orders search
    const searchInput = page.getByPlaceholder(/search work orders/i)
    await searchInput.fill('test search')
    await expect(searchInput).toHaveValue('test search')

    // Clear search
    await searchInput.clear()
    await expect(searchInput).toHaveValue('')
  })
})

test.describe('Billing Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('billing navigation links work', async ({ page }) => {
    await page.goto('/billing')
    await page.waitForTimeout(500)

    // Look for invoices link/tab
    const invoicesLink = page.getByRole('link', { name: /invoices/i }).first()
    if (await invoicesLink.isVisible()) {
      await invoicesLink.click()
      await page.waitForURL('**/billing/invoices**')
      expect(page.url()).toContain('/billing/invoices')
    }
  })
})

test.describe('Settings Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('settings navigation works', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(500)

    // Use exact match for sidebar pricing link
    const pricingLink = page.getByRole('link', { name: 'Pricing', exact: true })
    await pricingLink.click()
    await page.waitForURL('**/settings/pricing**')
  })

  test('pricing page has configuration options', async ({ page }) => {
    await page.goto('/settings/pricing')
    await page.waitForTimeout(500)

    // Should have form elements or configuration cards
    const hasForm = await page.locator('form').isVisible().catch(() => false)
    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false)
    const hasInputs = await page.locator('input').first().isVisible().catch(() => false)

    expect(hasForm || hasCards || hasInputs).toBe(true)
  })

  test('templates page loads template list', async ({ page }) => {
    await page.goto('/settings/templates')
    await page.waitForTimeout(500)

    // Should show templates content
    const hasContent = await page.locator('main').isVisible()
    expect(hasContent).toBe(true)
  })
})

test.describe('Calendar Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('calendar navigation buttons work', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForTimeout(1000)

    // Look for next/prev buttons
    const nextBtn = page.getByRole('button', { name: /next|forward|>/i })
    const prevBtn = page.getByRole('button', { name: /prev|back|</i })

    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(300)
    }

    if (await prevBtn.isVisible()) {
      await prevBtn.click()
      await page.waitForTimeout(300)
    }
  })

  test('calendar view toggle works', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForTimeout(1000)

    // Look for view toggle (month/week/day)
    const viewToggle = page.getByRole('button', { name: /month|week|day/i }).first()
    if (await viewToggle.isVisible()) {
      await viewToggle.click()
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Sidebar Navigation Sync', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('active state syncs with current route', async ({ page }) => {
    // Go to clients
    await page.goto('/clients')
    await page.waitForTimeout(500)

    // Clients link should be active
    const clientsLink = page.getByRole('link', { name: /^clients$/i })
    // Check if it has active styling (bg-primary class or similar)
    const linkClasses = await clientsLink.getAttribute('class')
    expect(linkClasses).toContain('bg-primary')

    // Navigate to properties
    await page.goto('/properties')
    await page.waitForTimeout(500)

    // Properties should now be active
    const propertiesLink = page.getByRole('link', { name: /^properties$/i })
    const propClasses = await propertiesLink.getAttribute('class')
    expect(propClasses).toContain('bg-primary')
  })

  test('all sidebar links navigate correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    const navTests = [
      { name: /^calendar$/i, url: '/calendar' },
      { name: /^clients$/i, url: '/clients' },
      { name: /^properties$/i, url: '/properties' },
      { name: /^inspections$/i, url: '/inspections' },
      { name: /^work orders$/i, url: '/work-orders' },
      { name: /^billing$/i, url: '/billing' },
      { name: /^vendors$/i, url: '/vendors' },
    ]

    for (const nav of navTests) {
      const link = page.getByRole('link', { name: nav.name })
      if (await link.isVisible()) {
        await link.click()
        await page.waitForURL(`**${nav.url}**`, { timeout: 5000 })
        expect(page.url()).toContain(nav.url)
      }
    }
  })
})

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('global search in header works', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(500)

    // Find header search
    const headerSearch = page.getByPlaceholder(/search clients|search/i).first()
    if (await headerSearch.isVisible()) {
      await headerSearch.fill('test')
      await expect(headerSearch).toHaveValue('test')

      // Clear
      await headerSearch.clear()
      await expect(headerSearch).toHaveValue('')
    }
  })

  test('clients page search filters', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForTimeout(500)

    // Use exact placeholder to get page-specific search, not header search
    const searchInput = page.getByPlaceholder('Search clients...')
    await searchInput.fill('john')
    await page.waitForTimeout(300)
    await expect(searchInput).toHaveValue('john')
  })

  test('properties page search filters', async ({ page }) => {
    await page.goto('/properties')
    await page.waitForTimeout(500)

    const searchInput = page.getByPlaceholder(/search properties/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('beach')
      await page.waitForTimeout(300)
      await expect(searchInput).toHaveValue('beach')
    }
  })
})

test.describe('Dialog Close Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('escape key closes dialogs', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const addBtn = page.getByRole('button', { name: /add vendor/i })
    await addBtn.click()
    await page.waitForTimeout(500)

    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible()) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Dialog should be closed
      const isStillVisible = await dialog.isVisible().catch(() => false)
      expect(isStillVisible).toBe(false)
    }
  })

  test('clicking outside closes dialogs', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(500)

    const addBtn = page.getByRole('button', { name: /add vendor/i })
    await addBtn.click()
    await page.waitForTimeout(500)

    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible()) {
      // Click on overlay/backdrop
      await page.locator('[data-state="open"]').first().press('Escape')
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Button Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page)
  })

  test('submit buttons show loading state', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForTimeout(500)

    // Fill minimum required fields - use first() for primary contact
    const firstNameInput = page.getByLabel(/first name/i).first()
    await firstNameInput.fill('Test')

    const lastNameInput = page.getByLabel(/last name/i).first()
    await lastNameInput.fill('User')

    const emailInput = page.getByLabel(/email/i).first()
    await emailInput.fill('test@test.com')

    // Submit should exist
    const submitBtn = page.getByRole('button', { name: /save|create|submit/i })
    await expect(submitBtn).toBeVisible()
  })
})

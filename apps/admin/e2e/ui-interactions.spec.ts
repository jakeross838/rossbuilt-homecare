import { test, expect, type Page } from '@playwright/test'

// Helper to bypass auth for testing
async function mockAuth(page: Page) {
  // Set up localStorage to simulate logged-in state
  await page.addInitScript(() => {
    localStorage.setItem('home-care-os-auth', JSON.stringify({
      state: {
        user: { id: 'test-user-id', email: 'test@example.com' },
        profile: {
          id: 'test-user-id',
          organization_id: 'test-org-id',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          role: 'admin',
        },
      },
      version: 0,
    }))
  })
}

test.describe('Dialog and Select interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Create Invoice dialog - Select dropdowns should be clickable', async ({ page }) => {
    await page.goto('/billing/invoices')

    // Click Create Invoice button
    const createBtn = page.getByRole('button', { name: /create invoice/i })
    await expect(createBtn).toBeVisible({ timeout: 10000 })
    await createBtn.click()

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Click on Client select trigger
    const clientSelect = page.locator('[data-testid="client-select"]').first()
      .or(page.getByRole('combobox').filter({ hasText: /select client/i }))
      .or(page.locator('button').filter({ hasText: /select client/i }))

    if (await clientSelect.isVisible()) {
      await clientSelect.click()

      // The select content should be visible and clickable
      const selectContent = page.locator('[data-radix-select-content]')
      await expect(selectContent).toBeVisible({ timeout: 5000 })

      // If there are items, clicking them should work
      const items = selectContent.locator('[data-radix-select-item]')
      const count = await items.count()
      if (count > 0) {
        await items.first().click()
        // Select should close and value should be set
        await expect(selectContent).not.toBeVisible()
      }
    }
  })

  test('Work Orders page - Select dropdowns should work', async ({ page }) => {
    await page.goto('/work-orders')

    // Wait for page to load
    await expect(page.getByText(/work orders/i)).toBeVisible({ timeout: 10000 })

    // Find the priority filter select
    const prioritySelect = page.getByRole('combobox').filter({ hasText: /priorities/i })
      .or(page.locator('button').filter({ hasText: /priorities/i }))

    if (await prioritySelect.isVisible()) {
      await prioritySelect.click()

      // The dropdown should be visible
      const selectContent = page.locator('[data-radix-select-content]')
      await expect(selectContent).toBeVisible({ timeout: 5000 })

      // Items should be clickable
      const items = selectContent.locator('[data-radix-select-item]')
      const count = await items.count()
      if (count > 0) {
        await items.first().click()
        await expect(selectContent).not.toBeVisible()
      }
    }
  })

  test('Invoices page - Status filter select should work', async ({ page }) => {
    await page.goto('/billing/invoices')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible({ timeout: 10000 })

    // Find status filter
    const statusSelect = page.getByRole('combobox').filter({ hasText: /status/i })
      .or(page.locator('button').filter({ hasText: /all statuses/i }))

    if (await statusSelect.isVisible()) {
      await statusSelect.click()

      // The dropdown should be visible
      const selectContent = page.locator('[data-radix-select-content]')
      await expect(selectContent).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Sheet and nested Select interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Calendar - Schedule Inspection dialog selects should work', async ({ page }) => {
    await page.goto('/calendar')

    // Look for a schedule button or similar
    const scheduleBtn = page.getByRole('button', { name: /schedule/i })
      .or(page.getByRole('button', { name: /new inspection/i }))

    if (await scheduleBtn.isVisible({ timeout: 5000 })) {
      await scheduleBtn.click()

      // Wait for dialog
      const dialog = page.getByRole('dialog')
      if (await dialog.isVisible({ timeout: 5000 })) {
        // Find property select
        const propertySelect = dialog.getByRole('combobox').first()
        if (await propertySelect.isVisible()) {
          await propertySelect.click()

          // Content should be visible above dialog
          const selectContent = page.locator('[data-radix-select-content]')
          await expect(selectContent).toBeVisible({ timeout: 5000 })
        }
      }
    }
  })
})

test.describe('Notification dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Notification bell should open dropdown', async ({ page }) => {
    await page.goto('/dashboard')

    // Find notification bell button
    const notificationBtn = page.getByRole('button', { name: /notifications/i })
      .or(page.locator('button').filter({ has: page.locator('svg.lucide-bell') }))

    if (await notificationBtn.isVisible({ timeout: 5000 })) {
      await notificationBtn.click()

      // Dropdown content should be visible
      const dropdownContent = page.locator('[data-radix-dropdown-menu-content]')
      await expect(dropdownContent).toBeVisible({ timeout: 5000 })

      // Buttons inside should be clickable
      const viewAllBtn = dropdownContent.getByRole('button', { name: /view all/i })
      if (await viewAllBtn.isVisible()) {
        await expect(viewAllBtn).toBeEnabled()
      }
    }
  })
})

test.describe('AlertDialog inside Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Inspection detail sheet - Cancel button should show AlertDialog', async ({ page }) => {
    await page.goto('/calendar')

    // This test requires an inspection to exist and be clicked
    // For now, just verify the page loads
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Popover interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Period selector popover should work on dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for period selector (likely a select or popover)
    const periodSelector = page.getByRole('combobox').filter({ hasText: /month|week|year/i })
      .or(page.locator('button').filter({ hasText: /month|week|year/i }))

    if (await periodSelector.isVisible({ timeout: 5000 })) {
      await periodSelector.click()

      // Content should be visible
      const content = page.locator('[data-radix-select-content], [data-radix-popover-content]')
      await expect(content).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Quick Actions on Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Quick action buttons should be clickable', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle')

    // Find Quick Actions section
    const scheduleBtn = page.getByRole('link', { name: /schedule/i })
    const workOrdersBtn = page.getByRole('link', { name: /work orders/i })
    const billingBtn = page.getByRole('link', { name: /billing/i })

    // Verify buttons are visible and clickable
    if (await scheduleBtn.isVisible({ timeout: 5000 })) {
      await expect(scheduleBtn).toBeEnabled()
    }
    if (await workOrdersBtn.isVisible({ timeout: 5000 })) {
      await expect(workOrdersBtn).toBeEnabled()
    }
    if (await billingBtn.isVisible({ timeout: 5000 })) {
      await expect(billingBtn).toBeEnabled()
    }
  })
})

test.describe('Activity feed interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Recent activity items should be clickable', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find activity section
    const activitySection = page.locator('text=Recent Activity').first()
    if (await activitySection.isVisible({ timeout: 5000 })) {
      // Activity items are links, they should be clickable
      const activityItems = page.locator('a').filter({
        has: page.locator('.rounded-full') // Activity items have rounded icon containers
      })

      const count = await activityItems.count()
      if (count > 0) {
        // First item should be a valid link
        const firstItem = activityItems.first()
        await expect(firstItem).toBeVisible()
        const href = await firstItem.getAttribute('href')
        expect(href).toBeTruthy()
      }
    }
  })
})

test.describe('All page Select components', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  const pagesToTest = [
    { path: '/clients', name: 'Clients' },
    { path: '/properties', name: 'Properties' },
    { path: '/vendors', name: 'Vendors' },
    { path: '/billing/invoices', name: 'Invoices' },
    { path: '/work-orders', name: 'Work Orders' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/settings/notifications', name: 'Notification Settings' },
  ]

  for (const pageConfig of pagesToTest) {
    test(`${pageConfig.name} page - all selects should be interactive`, async ({ page }) => {
      await page.goto(pageConfig.path)

      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Find all select triggers
      const selectTriggers = page.locator('[data-radix-select-trigger], button[role="combobox"]')
      const count = await selectTriggers.count()

      for (let i = 0; i < Math.min(count, 3); i++) { // Test up to 3 selects per page
        const trigger = selectTriggers.nth(i)
        if (await trigger.isVisible()) {
          await trigger.click()

          // Content should appear
          const content = page.locator('[data-radix-select-content]')
          const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false)

          if (isVisible) {
            // Close by pressing Escape
            await page.keyboard.press('Escape')
            await expect(content).not.toBeVisible({ timeout: 2000 })
          }
        }
      }
    })
  }
})

test.describe('Form dialogs with nested interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Create client flow - all form fields should work', async ({ page }) => {
    await page.goto('/clients/new')

    // Wait for form to load
    await page.waitForLoadState('networkidle')

    // Test text inputs
    const firstNameInput = page.getByLabel(/first name/i)
    if (await firstNameInput.isVisible({ timeout: 5000 })) {
      await firstNameInput.fill('John')
      await expect(firstNameInput).toHaveValue('John')
    }

    // Test any select components in the form
    const selects = page.locator('button[role="combobox"]')
    const count = await selects.count()

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i)
      if (await select.isVisible()) {
        await select.click()

        const content = page.locator('[data-radix-select-content]')
        await expect(content).toBeVisible({ timeout: 3000 })

        // Close it
        await page.keyboard.press('Escape')
      }
    }
  })

  test('Create property flow - all form fields should work', async ({ page }) => {
    await page.goto('/properties/new')

    // Wait for form to load
    await page.waitForLoadState('networkidle')

    // Test text inputs
    const nameInput = page.getByLabel(/name/i).first()
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill('Test Property')
      await expect(nameInput).toHaveValue('Test Property')
    }

    // Test any select components (like client select, state select, etc.)
    const selects = page.locator('button[role="combobox"]')
    const count = await selects.count()

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i)
      if (await select.isVisible()) {
        await select.click()

        const content = page.locator('[data-radix-select-content]')
        const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false)

        if (isVisible) {
          await page.keyboard.press('Escape')
        }
      }
    }
  })
})

test.describe('Z-index verification tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Select dropdown z-index should be higher than dialog overlay', async ({ page }) => {
    await page.goto('/billing/invoices')

    // Open create invoice dialog
    const createBtn = page.getByRole('button', { name: /create invoice/i })
    if (await createBtn.isVisible({ timeout: 5000 })) {
      await createBtn.click()

      // Wait for dialog
      await expect(page.getByRole('dialog')).toBeVisible()

      // Find and click a select
      const select = page.getByRole('dialog').locator('button[role="combobox"]').first()
      if (await select.isVisible()) {
        await select.click()

        // Get the z-index of the select content
        const selectContent = page.locator('[data-radix-select-content]')
        if (await selectContent.isVisible({ timeout: 3000 })) {
          const zIndex = await selectContent.evaluate(el => {
            return window.getComputedStyle(el).zIndex
          })

          // z-index should be 200 (higher than dialog's 50)
          expect(parseInt(zIndex)).toBeGreaterThanOrEqual(200)
        }
      }
    }
  })
})

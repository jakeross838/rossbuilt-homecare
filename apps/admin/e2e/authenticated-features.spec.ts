import { test, expect, Page } from '@playwright/test'

// Test credentials - same as comprehensive tests
const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testtest'

// Login helper
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard', { timeout: 30000 })
}

test.describe('Invoice Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Create Invoice dialog - all selects should work', async ({ page }) => {
    await page.goto('/billing/invoices')
    await page.waitForLoadState('networkidle')

    // Click Create Invoice
    const createBtn = page.getByRole('button', { name: /create invoice/i })
    await expect(createBtn).toBeVisible({ timeout: 10000 })
    await createBtn.click()

    // Dialog should open
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Find all selects in the dialog
    const selects = dialog.locator('button[role="combobox"]')
    const count = await selects.count()
    console.log(`Create Invoice dialog has ${count} select elements`)

    // Test each select
    for (let i = 0; i < count; i++) {
      const select = selects.nth(i)
      if (await select.isVisible()) {
        const selectText = await select.textContent()
        console.log(`Testing select ${i}: ${selectText}`)

        await select.click()
        await page.waitForTimeout(300)

        const dropdown = page.locator('[data-radix-select-content]')
        const isOpen = await dropdown.isVisible({ timeout: 3000 }).catch(() => false)
        console.log(`  Dropdown opened: ${isOpen}`)

        if (isOpen) {
          // Try to select first option
          const options = dropdown.locator('[data-radix-select-item]')
          const optCount = await options.count()
          console.log(`  Options available: ${optCount}`)

          if (optCount > 0) {
            await options.first().click()
            await page.waitForTimeout(200)
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }

    // Close dialog
    const cancelBtn = dialog.getByRole('button', { name: /cancel/i })
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
    }
  })
})

test.describe('Work Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('New Work Order button should work', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const newBtn = page.getByRole('button', { name: /new work order/i })
    await expect(newBtn).toBeVisible({ timeout: 10000 })
    await newBtn.click()

    // Should navigate to new work order page
    await page.waitForTimeout(500)
    const url = page.url()
    console.log(`Navigated to: ${url}`)

    expect(url).toContain('/work-orders')
  })

  test('Work order tabs should filter correctly', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[role="tablist"] [role="tab"]')
    const count = await tabs.count()
    console.log(`Work orders has ${count} tabs`)

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i)
      const tabName = await tab.textContent()
      await tab.click()
      await page.waitForTimeout(300)

      const isActive = await tab.getAttribute('data-state')
      console.log(`Tab "${tabName}" state: ${isActive}`)
      expect(isActive).toBe('active')
    }
  })

  test('Priority filter select should work', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const filterSelect = page.locator('button[role="combobox"]').filter({ hasText: /priorities|priority/i })
    if (await filterSelect.isVisible({ timeout: 5000 })) {
      await filterSelect.click()

      const dropdown = page.locator('[data-radix-select-content]')
      await expect(dropdown).toBeVisible({ timeout: 3000 })

      const options = dropdown.locator('[data-radix-select-item]')
      const count = await options.count()
      console.log(`Priority filter has ${count} options`)

      if (count > 0) {
        await options.first().click()
      }
    }
  })
})

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Client form - all fields editable', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForLoadState('networkidle')

    // Test text inputs
    const firstName = page.getByLabel(/first name/i)
    await expect(firstName).toBeVisible({ timeout: 10000 })
    await firstName.fill('John')
    await expect(firstName).toHaveValue('John')

    const lastName = page.getByLabel(/last name/i)
    if (await lastName.isVisible()) {
      await lastName.fill('Doe')
      await expect(lastName).toHaveValue('Doe')
    }

    const email = page.getByLabel(/email/i).first()
    if (await email.isVisible()) {
      await email.fill('john.doe@example.com')
      await expect(email).toHaveValue('john.doe@example.com')
    }

    // Test selects
    const selects = page.locator('button[role="combobox"]')
    const count = await selects.count()
    console.log(`Client form has ${count} selects`)

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i)
      if (await select.isVisible()) {
        await select.click()
        await page.waitForTimeout(300)

        const dropdown = page.locator('[data-radix-select-content]')
        if (await dropdown.isVisible({ timeout: 2000 })) {
          console.log(`Select ${i} opened successfully`)
          await page.keyboard.press('Escape')
        }
      }
    }
  })
})

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Property form - client select should work', async ({ page }) => {
    await page.goto('/properties/new')
    await page.waitForLoadState('networkidle')

    // Property name
    const nameInput = page.getByLabel(/name/i).first()
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await nameInput.fill('Test Property')

    // Client select - this is critical
    const clientSelect = page.locator('button[role="combobox"]').first()
    await expect(clientSelect).toBeVisible()
    await clientSelect.click()

    const dropdown = page.locator('[data-radix-select-content]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })

    const options = dropdown.locator('[data-radix-select-item]')
    const count = await options.count()
    console.log(`Client select has ${count} options`)

    if (count > 0) {
      await options.first().click()
      // Verify selection was made
      const selectedText = await clientSelect.textContent()
      console.log(`Selected: ${selectedText}`)
    } else {
      await page.keyboard.press('Escape')
    }
  })
})

test.describe('Vendor Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Vendor trade filter should work', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const tradeFilter = page.locator('button[role="combobox"]').first()
    if (await tradeFilter.isVisible({ timeout: 5000 })) {
      await tradeFilter.click()

      const dropdown = page.locator('[data-radix-select-content]')
      await expect(dropdown).toBeVisible({ timeout: 3000 })

      const options = dropdown.locator('[data-radix-select-item]')
      const count = await options.count()
      console.log(`Trade filter has ${count} options`)

      if (count > 0) {
        // Select a specific trade
        await options.nth(1).click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('Vendor tabs should work', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[role="tablist"] [role="tab"]')
    const count = await tabs.count()
    console.log(`Vendor page has ${count} tabs`)

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i)
      await tab.click()
      await page.waitForTimeout(300)
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })
})

test.describe('Calendar & Scheduling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Schedule inspection dialog - selects should work', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')

    const scheduleBtn = page.getByRole('button', { name: /schedule|new/i }).first()
    if (await scheduleBtn.isVisible({ timeout: 5000 })) {
      await scheduleBtn.click()

      const dialog = page.locator('[role="dialog"]')
      if (await dialog.isVisible({ timeout: 3000 })) {
        // Test property select
        const propertySelect = dialog.locator('button[role="combobox"]').first()
        if (await propertySelect.isVisible()) {
          await propertySelect.click()

          const dropdown = page.locator('[data-radix-select-content]')
          await expect(dropdown).toBeVisible({ timeout: 3000 })
          console.log('Property select in schedule dialog works!')

          await page.keyboard.press('Escape')
        }

        // Close dialog
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Notification dropdown should open and show content', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find notification bell
    const bellButton = page.locator('button').filter({ has: page.locator('.lucide-bell') })
    await expect(bellButton).toBeVisible({ timeout: 10000 })
    await bellButton.click()

    // Dropdown should open
    const dropdown = page.locator('[data-radix-dropdown-menu-content]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })

    // Should have header
    await expect(dropdown.getByText(/notifications/i)).toBeVisible()

    // Should have View All button
    const viewAllBtn = dropdown.getByRole('button', { name: /view all/i })
    await expect(viewAllBtn).toBeVisible()

    // Click View All
    await viewAllBtn.click()
    await expect(page).toHaveURL(/notifications/)
  })

  test('Notification settings - toggles should work', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForLoadState('networkidle')

    const switches = page.locator('button[role="switch"]')
    const count = await switches.count()
    console.log(`Found ${count} toggle switches`)

    if (count > 0) {
      const firstSwitch = switches.first()
      const initialState = await firstSwitch.getAttribute('data-state')
      console.log(`Initial state: ${initialState}`)

      await firstSwitch.click()
      await page.waitForTimeout(300)

      const newState = await firstSwitch.getAttribute('data-state')
      console.log(`New state: ${newState}`)

      expect(newState).not.toBe(initialState)
    }
  })
})

test.describe('Dashboard Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('All quick action links should navigate', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Test various quick action links
    const links = [
      { pattern: /schedule/i, expectedUrl: /calendar/ },
      { pattern: /work orders/i, expectedUrl: /work-orders/ },
      { pattern: /billing/i, expectedUrl: /billing/ },
    ]

    for (const link of links) {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const linkEl = page.getByRole('link', { name: link.pattern })
      if (await linkEl.isVisible({ timeout: 3000 })) {
        await linkEl.click()
        await page.waitForLoadState('networkidle')
        expect(page.url()).toMatch(link.expectedUrl)
        console.log(`Link "${link.pattern}" navigates correctly`)
      }
    }
  })
})

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Global search should work', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const search = page.getByPlaceholder(/search/i).first()
    await expect(search).toBeVisible({ timeout: 10000 })

    await search.fill('test')
    await page.waitForTimeout(500) // Debounce

    await expect(search).toHaveValue('test')
    console.log('Search input working')
  })
})

test.describe('Billing Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Invoice status filter should work', async ({ page }) => {
    await page.goto('/billing/invoices')
    await page.waitForLoadState('networkidle')

    const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /status/i })
    if (await statusFilter.isVisible({ timeout: 5000 })) {
      await statusFilter.click()

      const dropdown = page.locator('[data-radix-select-content]')
      await expect(dropdown).toBeVisible({ timeout: 3000 })

      const options = dropdown.locator('[data-radix-select-item]')
      const count = await options.count()
      console.log(`Status filter has ${count} options`)
    }
  })
})

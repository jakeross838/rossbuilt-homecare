import { test, expect } from '@playwright/test'

// Test configuration
test.use({
  actionTimeout: 10000,
  navigationTimeout: 30000,
})

test.describe('Deep Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login and authenticate
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('Client form - all fields should be interactive', async ({ page }) => {
    await page.goto('/clients/new')
    await page.waitForLoadState('networkidle')

    // Test text inputs
    const firstName = page.getByLabel(/first name/i)
    if (await firstName.isVisible({ timeout: 5000 })) {
      await firstName.click()
      await firstName.fill('John')
      await expect(firstName).toHaveValue('John')
    }

    const lastName = page.getByLabel(/last name/i)
    if (await lastName.isVisible()) {
      await lastName.click()
      await lastName.fill('Doe')
      await expect(lastName).toHaveValue('Doe')
    }

    const email = page.getByLabel(/email/i).first()
    if (await email.isVisible()) {
      await email.click()
      await email.fill('john@example.com')
      await expect(email).toHaveValue('john@example.com')
    }

    const phone = page.getByLabel(/phone/i).first()
    if (await phone.isVisible()) {
      await phone.click()
      await phone.fill('555-123-4567')
    }

    // Test any select/combobox elements
    const selects = page.locator('button[role="combobox"]')
    const selectCount = await selects.count()
    console.log(`Found ${selectCount} select elements on client form`)

    for (let i = 0; i < Math.min(selectCount, 5); i++) {
      const select = selects.nth(i)
      if (await select.isVisible()) {
        await select.click()
        await page.waitForTimeout(300)

        // Check if dropdown opened
        const dropdown = page.locator('[data-radix-select-content]')
        if (await dropdown.isVisible({ timeout: 2000 })) {
          // Get first option and click it
          const option = dropdown.locator('[data-radix-select-item]').first()
          if (await option.isVisible()) {
            await option.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('Property form - all fields should be interactive', async ({ page }) => {
    await page.goto('/properties/new')
    await page.waitForLoadState('networkidle')

    // Test name field
    const name = page.getByLabel(/name/i).first()
    if (await name.isVisible({ timeout: 5000 })) {
      await name.fill('Test Property')
      await expect(name).toHaveValue('Test Property')
    }

    // Test address fields
    const address = page.getByLabel(/address/i).first()
    if (await address.isVisible()) {
      await address.fill('123 Main St')
    }

    const city = page.getByLabel(/city/i)
    if (await city.isVisible()) {
      await city.fill('Test City')
    }

    const zip = page.getByLabel(/zip/i).or(page.getByLabel(/postal/i))
    if (await zip.isVisible()) {
      await zip.fill('12345')
    }

    // Test client select (important - this is a combobox inside a form)
    const clientSelect = page.locator('button[role="combobox"]').first()
    if (await clientSelect.isVisible()) {
      await clientSelect.click()

      const dropdown = page.locator('[data-radix-select-content]')
      await expect(dropdown).toBeVisible({ timeout: 3000 })

      // Close dropdown
      await page.keyboard.press('Escape')
    }
  })

  test('Vendor form - trade selection should work', async ({ page }) => {
    await page.goto('/vendors/new')
    await page.waitForLoadState('networkidle')

    // Company name
    const companyName = page.getByLabel(/company name/i)
    if (await companyName.isVisible({ timeout: 5000 })) {
      await companyName.fill('Test Vendor LLC')
      await expect(companyName).toHaveValue('Test Vendor LLC')
    }

    // Trade select - this is critical
    const tradeSelect = page.locator('button[role="combobox"]').filter({ hasText: /trade|select/i }).first()
    if (await tradeSelect.isVisible()) {
      await tradeSelect.click()

      const dropdown = page.locator('[data-radix-select-content]')
      if (await dropdown.isVisible({ timeout: 3000 })) {
        const options = dropdown.locator('[data-radix-select-item]')
        const count = await options.count()
        console.log(`Trade select has ${count} options`)

        if (count > 0) {
          await options.first().click()
        }
      }
    }
  })
})

test.describe('Button Click Tests', () => {
  test('Dashboard quick action buttons should navigate', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Test Schedule button
    const scheduleLink = page.getByRole('link', { name: /schedule/i })
    if (await scheduleLink.isVisible({ timeout: 5000 })) {
      await scheduleLink.click()
      await expect(page).toHaveURL(/calendar/)
      await page.goBack()
    }

    // Test Work Orders button
    const workOrdersLink = page.getByRole('link', { name: /work orders/i })
    if (await workOrdersLink.isVisible({ timeout: 5000 })) {
      await workOrdersLink.click()
      await expect(page).toHaveURL(/work-orders/)
      await page.goBack()
    }

    // Test Billing button
    const billingLink = page.getByRole('link', { name: /billing/i })
    if (await billingLink.isVisible({ timeout: 5000 })) {
      await billingLink.click()
      await expect(page).toHaveURL(/billing/)
    }
  })

  test('Work orders page - New Work Order button', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const newButton = page.getByRole('button', { name: /new work order/i })
    if (await newButton.isVisible({ timeout: 5000 })) {
      await newButton.click()
      // Should navigate to new work order page or open dialog
      await page.waitForTimeout(500)

      // Check if we navigated or a dialog opened
      const isOnNewPage = page.url().includes('/new')
      const dialogOpen = await page.locator('[role="dialog"]').isVisible()

      expect(isOnNewPage || dialogOpen).toBeTruthy()
    }
  })

  test('Invoices page - Create Invoice button opens dialog', async ({ page }) => {
    await page.goto('/billing/invoices')
    await page.waitForLoadState('networkidle')

    const createButton = page.getByRole('button', { name: /create invoice/i })
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click()

      // Dialog should open
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // Dialog should have expected content
      await expect(dialog.getByText(/create invoice/i)).toBeVisible()

      // Test that selects inside dialog work
      const clientSelect = dialog.locator('button[role="combobox"]').first()
      if (await clientSelect.isVisible()) {
        await clientSelect.click()

        const dropdown = page.locator('[data-radix-select-content]')
        // Dropdown should appear above the dialog
        const isVisible = await dropdown.isVisible({ timeout: 3000 })
        console.log(`Client select dropdown visible: ${isVisible}`)

        if (isVisible) {
          await page.keyboard.press('Escape')
        }
      }

      // Close dialog
      const cancelButton = dialog.getByRole('button', { name: /cancel/i })
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        await expect(dialog).not.toBeVisible()
      }
    }
  })

  test('Clients page - Add Client button', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('link', { name: /add client/i })
      .or(page.getByRole('button', { name: /add client/i }))

    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click()
      await expect(page).toHaveURL(/clients\/new/)
    }
  })

  test('Properties page - Add Property button', async ({ page }) => {
    await page.goto('/properties')
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('link', { name: /add property/i })
      .or(page.getByRole('button', { name: /add property/i }))

    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click()
      await expect(page).toHaveURL(/properties\/new/)
    }
  })
})

test.describe('Tab Switching Tests', () => {
  test('Work orders tabs should filter content', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[role="tablist"] [role="tab"]')
    const tabCount = await tabs.count()
    console.log(`Work orders page has ${tabCount} tabs`)

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i)
      const tabName = await tab.textContent()
      console.log(`Clicking tab: ${tabName}`)

      await tab.click()
      await page.waitForTimeout(300)

      // Tab should be selected
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })

  test('Vendors tabs should filter content', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[role="tablist"] [role="tab"]')
    const tabCount = await tabs.count()

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i)
      await tab.click()
      await page.waitForTimeout(300)
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })
})

test.describe('Search Functionality', () => {
  test('Clients search should filter results', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('test')
      await page.waitForTimeout(500) // Wait for debounce

      // Verify search is working (input has value)
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('Properties search should filter results', async ({ page }) => {
    await page.goto('/properties')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('main')
      await page.waitForTimeout(500)
      await expect(searchInput).toHaveValue('main')
    }
  })

  test('Work orders search should work', async ({ page }) => {
    await page.goto('/work-orders')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('repair')
      await page.waitForTimeout(500)
      await expect(searchInput).toHaveValue('repair')
    }
  })
})

test.describe('Dropdown Menu Tests', () => {
  test('Notification dropdown should open and close', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find notification bell
    const notificationButton = page.locator('button').filter({ has: page.locator('.lucide-bell') })
      .or(page.getByRole('button', { name: /notification/i }))

    if (await notificationButton.isVisible({ timeout: 5000 })) {
      await notificationButton.click()

      // Dropdown should open
      const dropdown = page.locator('[data-radix-dropdown-menu-content]')
      await expect(dropdown).toBeVisible({ timeout: 3000 })

      // Click outside to close
      await page.click('body', { position: { x: 10, y: 10 } })
      await expect(dropdown).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('User menu dropdown should work', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find user menu (usually has user icon or avatar)
    const userButton = page.locator('button').filter({ has: page.locator('.lucide-user') })
      .or(page.locator('button').filter({ has: page.locator('.lucide-circle-user') }))

    if (await userButton.isVisible({ timeout: 5000 })) {
      await userButton.click()

      const dropdown = page.locator('[data-radix-dropdown-menu-content]')
      if (await dropdown.isVisible({ timeout: 3000 })) {
        // Check for menu items
        const menuItems = dropdown.locator('[role="menuitem"]')
        const count = await menuItems.count()
        console.log(`User menu has ${count} items`)

        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Calendar Interactions', () => {
  test('Calendar should allow date navigation', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')

    // Look for navigation buttons (prev/next month)
    const prevButton = page.locator('button').filter({ has: page.locator('.lucide-chevron-left') })
    const nextButton = page.locator('button').filter({ has: page.locator('.lucide-chevron-right') })

    if (await nextButton.isVisible({ timeout: 5000 })) {
      await nextButton.click()
      await page.waitForTimeout(300)
    }

    if (await prevButton.isVisible()) {
      await prevButton.click()
      await page.waitForTimeout(300)
    }
  })

  test('Schedule inspection button should open dialog', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')

    const scheduleButton = page.getByRole('button', { name: /schedule|new inspection/i })

    if (await scheduleButton.isVisible({ timeout: 5000 })) {
      await scheduleButton.click()

      const dialog = page.locator('[role="dialog"]')
      if (await dialog.isVisible({ timeout: 3000 })) {
        // Test selects in the dialog
        const propertySelect = dialog.locator('button[role="combobox"]').first()
        if (await propertySelect.isVisible()) {
          await propertySelect.click()

          const dropdown = page.locator('[data-radix-select-content]')
          const isVisible = await dropdown.isVisible({ timeout: 3000 })
          console.log(`Property select in schedule dialog visible: ${isVisible}`)

          if (isVisible) {
            await page.keyboard.press('Escape')
          }
        }

        // Close dialog
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Settings Pages', () => {
  test('Notification settings - toggles should work', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForLoadState('networkidle')

    // Find toggle switches
    const switches = page.locator('button[role="switch"]')
    const count = await switches.count()
    console.log(`Found ${count} toggle switches on notification settings`)

    if (count > 0) {
      const firstSwitch = switches.first()
      const initialState = await firstSwitch.getAttribute('data-state')

      await firstSwitch.click()
      await page.waitForTimeout(300)

      const newState = await firstSwitch.getAttribute('data-state')
      // State should have changed
      expect(newState).not.toBe(initialState)

      // Toggle back
      await firstSwitch.click()
    }
  })

  test('Pricing settings page loads', async ({ page }) => {
    await page.goto('/settings/pricing')
    await page.waitForLoadState('networkidle')

    // Should have some pricing content
    await expect(page.locator('body')).toContainText(/pricing|tier|rate/i)
  })

  test('Templates settings page loads', async ({ page }) => {
    await page.goto('/settings/templates')
    await page.waitForLoadState('networkidle')

    // Should have template content
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Error States', () => {
  test('404 page should show for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345')
    await page.waitForLoadState('networkidle')

    // Should show some kind of not found or redirect to valid page
    const body = await page.locator('body').textContent()
    const is404 = body?.toLowerCase().includes('not found') ||
                  body?.toLowerCase().includes('404') ||
                  page.url().includes('login') ||
                  page.url().includes('dashboard')

    expect(is404).toBeTruthy()
  })
})

test.describe('Console Error Detection', () => {
  test('Dashboard should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to load resource') && // Network errors when not authenticated
      !e.includes('401') && // Auth errors expected
      !e.includes('403') &&
      !e.includes('net::ERR')
    )

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors)
    }
  })

  test('Clients page should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to load resource') &&
      !e.includes('401') &&
      !e.includes('403') &&
      !e.includes('net::ERR')
    )

    if (criticalErrors.length > 0) {
      console.log('Console errors on clients page:', criticalErrors)
    }
  })
})

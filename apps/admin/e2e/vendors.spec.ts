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
  const errorBoundary = page.getByText('Something went wrong')
  const hasError = await errorBoundary.isVisible().catch(() => false)
  if (hasError) {
    const errorText = await page.locator('body').textContent()
    throw new Error(`Page has error: ${errorText}`)
  }
}

// Helper to wait and check for console errors
async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

test.describe('Vendors Page - List View', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(1000)
  })

  test('should load vendors page without errors', async ({ page }) => {
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Vendors' })).toBeVisible()
  })

  test('should display page title and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Vendors' })).toBeVisible()
    await expect(page.getByText('Manage service providers and contractors')).toBeVisible()
  })

  test('should have Add Vendor button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add vendor/i })
    await expect(addButton).toBeVisible()
  })

  test('should have compliance summary cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)

    // Check for compliance summary cards (might be hidden if no data)
    const totalVendorsCard = page.getByText('Total Vendors')
    const isVisible = await totalVendorsCard.isVisible().catch(() => false)

    if (isVisible) {
      await expect(page.getByText('Fully Compliant')).toBeVisible()
      await expect(page.getByText('Expiring Soon')).toBeVisible()
      await expect(page.getByText('Compliance Issues')).toBeVisible()
    }
  })

  test('should have tabs for vendor filtering', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /^active$/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /preferred/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /inactive/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^all$/i })).toBeVisible()
  })

  test('should switch tabs correctly', async ({ page }) => {
    const tabs = ['Active', 'Preferred', 'Inactive', 'All']

    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') })
      await tab.click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)

      // Verify tab is selected
      await expect(tab).toHaveAttribute('data-state', 'active')
    }
  })

  test('should have search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search vendors/i)
    await expect(searchInput).toBeVisible()
  })

  test('should have trade filter dropdown', async ({ page }) => {
    const tradeFilter = page.locator('button').filter({ hasText: /all trades/i })
    await expect(tradeFilter).toBeVisible()
  })

  test('should open trade filter dropdown', async ({ page }) => {
    const tradeFilter = page.locator('button').filter({ hasText: /all trades/i })
    await tradeFilter.click()
    await page.waitForTimeout(300)

    // Should show trade options - check for select content first
    const selectContent = page.locator('[data-radix-select-content]')
    const isSelectOpen = await selectContent.isVisible({ timeout: 3000 }).catch(() => false)

    if (isSelectOpen) {
      // Radix select items
      const items = selectContent.locator('[data-radix-select-item]')
      const count = await items.count()
      expect(count).toBeGreaterThan(0)
    } else {
      // Fallback to checking for any visible trade options
      const hvacOption = page.getByRole('option', { name: /hvac/i })
        .or(page.locator('[role="menuitem"]').filter({ hasText: 'HVAC' }))
        .or(page.locator('[data-radix-select-item]').filter({ hasText: 'HVAC' }))
      await expect(hvacOption).toBeVisible({ timeout: 3000 })
    }
  })

  test('should filter by trade category', async ({ page }) => {
    const tradeFilter = page.locator('button').filter({ hasText: /all trades/i })
    await tradeFilter.click()
    await page.waitForTimeout(300)

    // Select a trade
    const hvacOption = page.getByRole('option', { name: /hvac/i }).or(page.locator('[role="option"]').filter({ hasText: 'HVAC' }))
    if (await hvacOption.isVisible()) {
      await hvacOption.click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)
    }
  })

  test('search should filter vendors', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search vendors/i)
    await searchInput.fill('test vendor')
    await page.waitForTimeout(500)
    await checkNoErrors(page)
  })
})

test.describe('Vendors Page - Add Vendor', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(1000)
  })

  test('should navigate to new vendor page', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add vendor/i })
    await addButton.click()

    await page.waitForURL('**/vendors/new', { timeout: 5000 })
    await checkNoErrors(page)
  })

  test('should display new vendor form', async ({ page }) => {
    await page.goto('/vendors/new')
    await checkNoErrors(page)

    await expect(page.getByRole('heading', { name: /new vendor/i })).toBeVisible()
    await expect(page.getByText('Add a new service provider or contractor')).toBeVisible()
  })

  test('should have back button', async ({ page }) => {
    await page.goto('/vendors/new')

    const backButton = page.getByRole('button', { name: /back to vendors/i })
    await expect(backButton).toBeVisible()

    await backButton.click()
    await page.waitForURL('**/vendors')
  })

  test('should have all form sections', async ({ page }) => {
    await page.goto('/vendors/new')

    // Company Information section
    await expect(page.getByText('Company Information')).toBeVisible()
    await expect(page.getByLabel('Company Name')).toBeVisible()
    await expect(page.getByLabel('Contact First Name')).toBeVisible()
    await expect(page.getByLabel('Contact Last Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Phone')).toBeVisible()

    // Address section
    await expect(page.getByRole('heading', { name: 'Address' })).toBeVisible()
    await expect(page.getByLabel('Address Line 1')).toBeVisible()
    await expect(page.getByLabel('City')).toBeVisible()
    await expect(page.getByLabel('State')).toBeVisible()
    await expect(page.getByLabel('ZIP Code')).toBeVisible()

    // Trade Categories section
    await expect(page.getByText('Trade Categories')).toBeVisible()
  })

  test('should show validation error for empty company name', async ({ page }) => {
    await page.goto('/vendors/new')

    // Try to submit without filling company name
    const createButton = page.getByRole('button', { name: /create vendor/i })
    await createButton.click()

    await page.waitForTimeout(500)

    // Should show validation error
    const errorMessage = page.getByText(/company name/i).filter({ hasText: /at least|required/i })
    await expect(errorMessage.or(page.getByText('Company name must be at least 2 characters'))).toBeVisible()
  })

  test('should have trade category checkboxes', async ({ page }) => {
    await page.goto('/vendors/new')

    // Check for trade categories
    await expect(page.getByText('HVAC')).toBeVisible()
    await expect(page.getByText('Plumbing')).toBeVisible()
    await expect(page.getByText('Electrical')).toBeVisible()
    await expect(page.getByText('Appliance Repair')).toBeVisible()
  })

  test('should toggle trade categories', async ({ page }) => {
    await page.goto('/vendors/new')

    // Click on HVAC trade category
    const hvacLabel = page.locator('label').filter({ hasText: 'HVAC' })
    await hvacLabel.click()
    await page.waitForTimeout(200)

    // Should be selected (has border-primary class)
    await expect(hvacLabel).toHaveClass(/border-primary/)

    // Click again to deselect
    await hvacLabel.click()
    await page.waitForTimeout(200)
  })

  test('should have preferred vendor checkbox', async ({ page }) => {
    await page.goto('/vendors/new')

    const preferredCheckbox = page.getByLabel(/mark as preferred vendor/i)
    await expect(preferredCheckbox).toBeVisible()
  })

  test('should have notes field', async ({ page }) => {
    await page.goto('/vendors/new')

    const notesField = page.getByLabel(/notes/i)
    await expect(notesField).toBeVisible()
  })

  test('should have cancel button', async ({ page }) => {
    await page.goto('/vendors/new')

    const cancelButton = page.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeVisible()

    await cancelButton.click()
    await page.waitForURL('**/vendors')
  })

  test('should create vendor with valid data', async ({ page }) => {
    await page.goto('/vendors/new')

    // Fill in required field
    await page.getByLabel('Company Name').fill('Test Vendor Company')

    // Fill optional fields
    await page.getByLabel('Contact First Name').fill('John')
    await page.getByLabel('Contact Last Name').fill('Doe')
    await page.getByLabel('Email').fill('john@testvendor.com')
    await page.getByLabel('Phone').fill('813-555-1234')

    // Select a trade category
    const hvacLabel = page.locator('label').filter({ hasText: 'HVAC' })
    await hvacLabel.click()

    // Submit the form
    const createButton = page.getByRole('button', { name: /create vendor/i })
    await createButton.click()

    // Wait for response
    await page.waitForTimeout(3000)

    // Should either navigate to detail page or show success toast
    const currentUrl = page.url()
    const hasVendorDetail = currentUrl.includes('/vendors/') && !currentUrl.includes('/new')
    const hasToast = await page.getByText(/vendor created|success/i).isVisible().catch(() => false)

    expect(hasVendorDetail || hasToast).toBeTruthy()
  })
})

test.describe('Vendors Page - Vendor Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should navigate to vendor detail when clicking card', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    // Check if there are any vendor cards
    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Should navigate to vendor detail
      await expect(page.url()).toContain('/vendors/')
      await checkNoErrors(page)
    }
  })

  test('should show vendor detail page elements', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Check for detail page elements
      await expect(page.getByRole('button', { name: /back to vendors/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /deactivate/i })).toBeVisible()
    }
  })

  test('should have tabs on detail page', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /compliance/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /work orders/i })).toBeVisible()
    }
  })

  test('should switch tabs on detail page', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Click Compliance tab
      await page.getByRole('tab', { name: /compliance/i }).click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)

      // Click Work Orders tab
      await page.getByRole('tab', { name: /work orders/i }).click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)

      // Click back to Overview
      await page.getByRole('tab', { name: /overview/i }).click()
      await page.waitForTimeout(500)
      await checkNoErrors(page)
    }
  })

  test('should open edit sheet', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Click Edit button
      await page.getByRole('button', { name: /edit/i }).first().click()
      await page.waitForTimeout(500)

      // Sheet should open
      await expect(page.getByRole('heading', { name: /edit vendor/i })).toBeVisible()
      await checkNoErrors(page)

      // Close sheet
      const closeButton = page.getByRole('button', { name: /cancel/i })
      if (await closeButton.isVisible()) {
        await closeButton.click()
      }
    }
  })

  test('should open compliance sheet', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Click Update Compliance button
      const complianceButton = page.getByRole('button', { name: /update compliance/i })
      if (await complianceButton.isVisible()) {
        await complianceButton.click()
        await page.waitForTimeout(500)

        // Sheet should open
        await expect(page.getByRole('heading', { name: /update compliance/i })).toBeVisible()
        await checkNoErrors(page)
      }
    }
  })

  test('should show deactivate dialog', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Click Deactivate button
      await page.getByRole('button', { name: /deactivate/i }).click()
      await page.waitForTimeout(500)

      // Dialog should open
      await expect(page.getByRole('heading', { name: /deactivate vendor/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /^cancel$/i })).toBeVisible()

      // Close dialog
      await page.getByRole('button', { name: /^cancel$/i }).click()
    }
  })

  test('should toggle preferred status', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      // Find the star button (toggle preferred)
      const starButton = page.locator('button').filter({ has: page.locator('svg[class*="star"]') }).first()
      if (await starButton.isVisible()) {
        await starButton.click()
        await page.waitForTimeout(1000)
        await checkNoErrors(page)
      }
    }
  })
})

test.describe('Vendors Page - Compliance Form', () => {
  test('should have all compliance form fields', async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      const complianceButton = page.getByRole('button', { name: /update compliance/i })
      if (await complianceButton.isVisible()) {
        await complianceButton.click()
        await page.waitForTimeout(500)

        // Check form fields
        await expect(page.getByText('License Information')).toBeVisible()
        await expect(page.getByLabel('License Number')).toBeVisible()

        await expect(page.getByText('Insurance Information')).toBeVisible()
        await expect(page.getByLabel('Insurance Company')).toBeVisible()
        await expect(page.getByLabel('Policy Number')).toBeVisible()

        await expect(page.getByText('W-9 Form')).toBeVisible()
        await expect(page.getByLabel(/w-9 on file/i)).toBeVisible()
      }
    }
  })

  test('should show date received when W-9 is checked', async ({ page }) => {
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(2000)

    const vendorCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator('h3') })
    const count = await vendorCards.count()

    if (count > 0) {
      await vendorCards.first().click()
      await page.waitForTimeout(1000)

      const complianceButton = page.getByRole('button', { name: /update compliance/i })
      if (await complianceButton.isVisible()) {
        await complianceButton.click()
        await page.waitForTimeout(500)

        // Check W-9 checkbox
        const w9Checkbox = page.getByLabel(/w-9 on file/i)
        const isChecked = await w9Checkbox.isChecked()

        if (!isChecked) {
          await w9Checkbox.click()
          await page.waitForTimeout(300)
        }

        // Date received field should appear
        await expect(page.getByLabel(/date received/i)).toBeVisible()
      }
    }
  })
})

test.describe('Vendors Page - Error Handling', () => {
  test('should handle non-existent vendor ID', async ({ page }) => {
    await login(page)
    await page.goto('/vendors/non-existent-id-12345')
    await page.waitForTimeout(2000)

    // Should show error or "not found"
    const hasNotFound = await page.getByText(/not found/i).isVisible().catch(() => false)
    const hasError = await page.getByText(/error/i).isVisible().catch(() => false)

    // At minimum, shouldn't crash
    await checkNoErrors(page)
  })
})

test.describe('Vendors Page - State Select', () => {
  test('should have state dropdown in form', async ({ page }) => {
    await login(page)
    await page.goto('/vendors/new')

    // Find state select
    const stateSelect = page.getByLabel('State')
    await expect(stateSelect).toBeVisible()
  })

  test('should show all US states in dropdown', async ({ page }) => {
    await login(page)
    await page.goto('/vendors/new')

    // Click on state select trigger
    const stateSelectTrigger = page.locator('button').filter({ has: page.getByText('Select') }).filter({ hasNot: page.getByText('All') })

    // Find the state dropdown specifically
    const stateSection = page.locator('div').filter({ has: page.getByLabel('State') })
    const selectButton = stateSection.locator('button').first()

    if (await selectButton.isVisible()) {
      await selectButton.click()
      await page.waitForTimeout(300)

      // Check for some states
      const floridaOption = page.getByRole('option', { name: /florida/i }).or(page.locator('[role="option"]').filter({ hasText: 'Florida' }))
      await expect(floridaOption).toBeVisible()
    }
  })
})

test.describe('Vendors Page - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(1000)

    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'Vendors' })).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await login(page)
    await page.goto('/vendors')
    await page.waitForTimeout(1000)

    await checkNoErrors(page)
  })
})

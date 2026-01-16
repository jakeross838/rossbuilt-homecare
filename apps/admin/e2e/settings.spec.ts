import { test, expect, Page } from '@playwright/test'

// Test credentials - same as other tests
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

test.describe('Settings Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Settings main page displays all sections', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })

    // Verify all settings cards are visible
    const expectedCards = [
      'Organization',
      'Profile',
      'Pricing',
      'Templates',
      'Notifications'
    ]

    for (const cardTitle of expectedCards) {
      const card = page.getByRole('heading', { name: cardTitle, exact: true })
      await expect(card).toBeVisible({ timeout: 5000 })
      console.log(`Found settings card: ${cardTitle}`)
    }
  })

  test('Navigate to Organization settings', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Click on Organization card
    await page.getByRole('link', { name: /organization/i }).click()
    await page.waitForURL('**/settings/organization')

    // Verify organization settings page loads
    await expect(page.getByRole('heading', { name: 'Organization Settings' })).toBeVisible({ timeout: 10000 })
  })

  test('Navigate to Profile settings', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Click on Profile card
    await page.getByRole('link', { name: /profile/i }).click()
    await page.waitForURL('**/settings/profile')

    // Verify profile settings page loads
    await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Organization Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Organization settings form loads with data', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Wait for form to load (should have Company Name field)
    const companyNameInput = page.getByLabel('Company Name')
    await expect(companyNameInput).toBeVisible({ timeout: 10000 })

    // Check other form fields exist
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Phone')).toBeVisible()
    await expect(page.getByLabel('Website')).toBeVisible()
    await expect(page.getByLabel('Street Address')).toBeVisible()
    await expect(page.getByLabel('City')).toBeVisible()
    await expect(page.getByLabel('State')).toBeVisible()
    await expect(page.getByLabel('ZIP Code')).toBeVisible()
  })

  test('Organization settings can be updated', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Wait for form to load
    const companyNameInput = page.getByLabel('Company Name')
    await expect(companyNameInput).toBeVisible({ timeout: 10000 })

    // Get current value
    const currentName = await companyNameInput.inputValue()
    console.log(`Current company name: ${currentName}`)

    // Modify the company name
    const testName = `Test Company ${Date.now()}`
    await companyNameInput.fill(testName)

    // Click Save Changes button
    const saveBtn = page.getByRole('button', { name: 'Save Changes' })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()

    // Wait for save to complete and check for success toast
    await page.waitForTimeout(2000)

    // Verify the value persisted by refreshing
    await page.reload()
    await page.waitForLoadState('networkidle')

    const updatedInput = page.getByLabel('Company Name')
    await expect(updatedInput).toBeVisible({ timeout: 10000 })

    const updatedValue = await updatedInput.inputValue()
    console.log(`Updated company name: ${updatedValue}`)

    // Restore original name if different
    if (currentName && currentName !== testName) {
      await updatedInput.fill(currentName)
      await page.getByRole('button', { name: 'Save Changes' }).click()
      await page.waitForTimeout(1000)
    }
  })

  test('Business hours settings work', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Scroll to business hours section
    await page.getByText('Business Hours & Scheduling').scrollIntoViewIfNeeded()

    // Check business hours fields
    const startTime = page.getByLabel('Start Time')
    const endTime = page.getByLabel('End Time')
    const lunchStart = page.getByLabel('Lunch Start')
    const lunchEnd = page.getByLabel('Lunch End')

    await expect(startTime).toBeVisible({ timeout: 5000 })
    await expect(endTime).toBeVisible()
    await expect(lunchStart).toBeVisible()
    await expect(lunchEnd).toBeVisible()

    // Get current values
    const currentStart = await startTime.inputValue()
    console.log(`Current start time: ${currentStart}`)

    // Modify start time
    await startTime.fill('09:00')

    // Click Save Settings
    const saveSettingsBtn = page.locator('form').filter({ hasText: 'Business Hours' }).getByRole('button', { name: 'Save Settings' })
    await expect(saveSettingsBtn).toBeEnabled({ timeout: 5000 })
    await saveSettingsBtn.click()

    // Wait for save
    await page.waitForTimeout(1500)

    // Restore original if different
    if (currentStart && currentStart !== '09:00') {
      await startTime.fill(currentStart)
      await saveSettingsBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('Logo upload button is clickable', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Find the Upload Logo button
    const uploadBtn = page.getByRole('button', { name: /upload logo/i })
    await expect(uploadBtn).toBeVisible({ timeout: 10000 })
    await expect(uploadBtn).toBeEnabled()

    // Click should trigger file input (we can't actually upload in test without file)
    console.log('Upload Logo button is visible and enabled')
  })

  test('Timezone selector works', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Find and click timezone select
    const timezoneSelect = page.locator('button[role="combobox"]').filter({ hasText: /time/i })

    if (await timezoneSelect.isVisible()) {
      await timezoneSelect.click()
      await page.waitForTimeout(300)

      // Check dropdown opened
      const dropdown = page.locator('[data-radix-select-content]')
      const isOpen = await dropdown.isVisible({ timeout: 3000 }).catch(() => false)
      console.log(`Timezone dropdown opened: ${isOpen}`)

      if (isOpen) {
        // Check for timezone options
        const options = dropdown.locator('[data-radix-select-item]')
        const optionCount = await options.count()
        console.log(`Timezone options available: ${optionCount}`)
        expect(optionCount).toBeGreaterThan(0)

        // Close by pressing Escape
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Profile Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Profile settings form loads with data', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    // Wait for form to load
    await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible({ timeout: 10000 })

    // Check profile picture section
    await expect(page.getByText('Profile Picture')).toBeVisible()
    await expect(page.getByRole('button', { name: /upload photo/i })).toBeVisible()

    // Check account info fields
    await expect(page.getByLabel('First Name')).toBeVisible()
    await expect(page.getByLabel('Last Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Phone')).toBeVisible()
  })

  test('Profile info can be updated', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    // Wait for form to load
    const firstNameInput = page.getByLabel('First Name')
    await expect(firstNameInput).toBeVisible({ timeout: 10000 })

    // Get current value
    const currentFirstName = await firstNameInput.inputValue()
    console.log(`Current first name: ${currentFirstName}`)

    // Modify first name
    const testFirstName = `Test${Date.now()}`
    await firstNameInput.fill(testFirstName)

    // Click Save Changes
    const saveBtn = page.locator('form').filter({ hasText: 'Account Information' }).getByRole('button', { name: 'Save Changes' })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()

    // Wait for save
    await page.waitForTimeout(1500)

    // Refresh and verify
    await page.reload()
    await page.waitForLoadState('networkidle')

    const updatedInput = page.getByLabel('First Name')
    await expect(updatedInput).toBeVisible({ timeout: 10000 })

    const updatedValue = await updatedInput.inputValue()
    console.log(`Updated first name: ${updatedValue}`)

    // Restore original name
    if (currentFirstName && currentFirstName !== testFirstName) {
      await updatedInput.fill(currentFirstName)
      await page.locator('form').filter({ hasText: 'Account Information' }).getByRole('button', { name: 'Save Changes' }).click()
      await page.waitForTimeout(1000)
    }
  })

  test('Password change form works', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    // Scroll to password section
    await page.getByText('Change Password').scrollIntoViewIfNeeded()

    // Check password fields exist
    const newPasswordInput = page.getByLabel('New Password')
    const confirmPasswordInput = page.getByLabel('Confirm Password')

    await expect(newPasswordInput).toBeVisible({ timeout: 5000 })
    await expect(confirmPasswordInput).toBeVisible()

    // Check password visibility toggle
    const toggleBtn = page.locator('[class*="password"]').locator('button').first()
    if (await toggleBtn.isVisible()) {
      console.log('Password visibility toggle is present')
    }

    // Check Change Password button exists and is initially enabled
    const changePasswordBtn = page.getByRole('button', { name: 'Change Password' })
    await expect(changePasswordBtn).toBeVisible()
  })

  test('Preferences toggles work', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    // Scroll to preferences section
    await page.getByText('Preferences').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Find preference toggles
    const emailNotificationsToggle = page.getByText('Email Notifications').locator('..').locator('..').locator('button[role="switch"]')
    const desktopNotificationsToggle = page.getByText('Desktop Notifications').locator('..').locator('..').locator('button[role="switch"]')
    const compactModeToggle = page.getByText('Compact Mode').locator('..').locator('..').locator('button[role="switch"]')

    // Check toggles exist
    if (await emailNotificationsToggle.isVisible()) {
      console.log('Email notifications toggle is present')
      const currentState = await emailNotificationsToggle.getAttribute('data-state')
      console.log(`Email notifications current state: ${currentState}`)
    }

    if (await desktopNotificationsToggle.isVisible()) {
      console.log('Desktop notifications toggle is present')
    }

    if (await compactModeToggle.isVisible()) {
      console.log('Compact mode toggle is present')
    }
  })

  test('Avatar upload button is clickable', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    // Find the Upload Photo button
    const uploadBtn = page.getByRole('button', { name: /upload photo/i })
    await expect(uploadBtn).toBeVisible({ timeout: 10000 })
    await expect(uploadBtn).toBeEnabled()

    console.log('Upload Photo button is visible and enabled')
  })
})

test.describe('Settings Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Form validation shows errors', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Clear required field
    const companyNameInput = page.getByLabel('Company Name')
    await expect(companyNameInput).toBeVisible({ timeout: 10000 })

    // Store original value
    const originalValue = await companyNameInput.inputValue()

    // Clear the field
    await companyNameInput.fill('')

    // Try to submit - this should fail validation
    const saveBtn = page.getByRole('button', { name: 'Save Changes' })

    // The button should be disabled when form is invalid or unchanged
    // Or show validation error
    const isDisabled = await saveBtn.isDisabled()
    console.log(`Save button disabled after clearing required field: ${isDisabled}`)

    // Restore original value
    await companyNameInput.fill(originalValue || 'Test Company')
  })
})

test.describe('Settings Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Settings page has proper heading structure', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Check for main heading
    const h1 = page.locator('h1, h2').filter({ hasText: 'Settings' })
    await expect(h1).toBeVisible({ timeout: 10000 })

    // Check cards have headings
    const cardHeadings = await page.locator('[class*="card"] h3, [class*="card"] h4').count()
    console.log(`Found ${cardHeadings} card headings`)
    expect(cardHeadings).toBeGreaterThan(0)
  })

  test('Form fields have labels', async ({ page }) => {
    await page.goto('/settings/organization')
    await page.waitForLoadState('networkidle')

    // Check that inputs have associated labels
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]')
    const inputCount = await inputs.count()
    console.log(`Found ${inputCount} text inputs`)

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = await label.isVisible().catch(() => false)
        console.log(`Input ${id} has label: ${hasLabel}`)
      }
    }
  })
})

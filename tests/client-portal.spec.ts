import { test, expect } from '@playwright/test'

test.describe('Client Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portal')
  })

  test('displays login form', async ({ page }) => {
    await expect(page.locator('text=Client Portal')).toBeVisible()
    await expect(page.locator('text=Sign in to view your properties')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 })
  })

  test('can login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    // Should see welcome message and property
    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })
  })

  test('displays property details after login', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    // Wait for login
    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Should show property info (use heading to be specific)
    await expect(page.locator('h2:has-text("Sunset Apartments"), h2:has-text("Palm Gardens")')).toBeVisible()
  })

  test('shows property switcher for multi-property clients', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Client has 2 properties, so switcher should be visible
    // Look for the select trigger with a building icon
    const propertySelector = page.locator('button:has-text("Sunset Apartments"), button:has-text("Palm Gardens")')
    await expect(propertySelector.first()).toBeVisible()
  })

  test('can switch between properties', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Click on property dropdown if visible
    const dropdown = page.locator('[role="combobox"]:has-text("Sunset Apartments"), [role="combobox"]:has-text("Palm Gardens")')
    if (await dropdown.count() > 0) {
      await dropdown.first().click()
      // Select different property
      await page.locator('[role="option"]:has-text("Palm Gardens")').click()
      await expect(page.locator('h2:has-text("Palm Gardens")')).toBeVisible()
    }
  })

  test('displays inspection reports tab', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Check tabs
    await expect(page.locator('button:has-text("Inspection Reports")')).toBeVisible()
  })

  test('displays maintenance tab', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    await page.click('button:has-text("Maintenance")')
    await expect(page.locator('h3:has-text("Maintenance Requests")')).toBeVisible()
  })

  test('displays special requests tab', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    await page.click('button:has-text("Special Requests")')
    await expect(page.locator('h3:has-text("Special Requests")')).toBeVisible()
  })

  test('can sign out', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Click sign out
    await page.click('button:has-text("Sign Out")')

    // Should show login form again
    await expect(page.locator('text=Sign in to view your properties')).toBeVisible()
  })

  test('shows quick stats on property card', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test123')
    await page.click('button:has-text("Sign In")')

    await expect(page.locator('text=Welcome, Test Client')).toBeVisible({ timeout: 10000 })

    // Should show stats
    await expect(page.locator('text=Open Requests')).toBeVisible()
    await expect(page.locator('text=Completed Checks')).toBeVisible()
  })
})

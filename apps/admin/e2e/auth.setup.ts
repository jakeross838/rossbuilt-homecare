import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login')

  // Wait for the login form to be visible
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

  // Fill in credentials
  await page.getByLabel('Email').fill('test@test.com')
  await page.getByLabel('Password').fill('testtest')

  // Click sign in button
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 30000 })

  // Verify we're on the dashboard
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE })
})

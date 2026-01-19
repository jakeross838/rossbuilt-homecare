# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- Playwright v1.57.0 for E2E tests
- Config: `apps/admin/playwright.config.ts`
- No unit test framework detected (Jest/Vitest not configured)

**Assertion Library:**
- Playwright's built-in `expect` API

**Run Commands:**
```bash
cd apps/admin
npx playwright test              # Run all E2E tests
npx playwright test --ui         # Run with UI mode
npx playwright test --headed     # Run with browser visible
npx playwright show-report       # View HTML report after run
```

## Test File Organization

**Location:**
- E2E tests: `apps/admin/e2e/` directory (separate from source)
- No co-located unit tests detected

**Naming:**
- `*.spec.ts` for test files
- `*.setup.ts` for setup/fixtures

**Structure:**
```
apps/admin/e2e/
├── auth.setup.ts                  # Auth state setup
├── all-pages-health.spec.ts       # Page load validation
├── authenticated-features.spec.ts # Auth-required flows
├── comprehensive.spec.ts          # Full feature coverage
├── deep-interactions.spec.ts      # Complex UI interactions
├── interactions-sync.spec.ts      # Data sync tests
├── settings.spec.ts               # Settings page tests
├── ui-interactions.spec.ts        # UI component tests
├── vendors.spec.ts                # Vendor module tests
└── visual-capture.spec.ts         # Screenshot tests
```

## Test Structure

**Suite Organization:**
```typescript
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

test.describe('Module Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should do something', async ({ page }) => {
    await page.goto('/route')
    await expect(page.getByRole('heading', { name: 'Title' })).toBeVisible()
  })
})
```

**Patterns:**
- `test.describe()` groups related tests by feature/module
- `test.beforeEach()` for common setup (login, navigation)
- Helper functions for repetitive actions
- Descriptive test names: `should [action] [expected result]`

## Mocking

**Framework:** Playwright built-in mocking (no separate mock library)

**Patterns:**
- Mock auth state via localStorage injection
- No API mocking detected (tests run against real Supabase)

**Auth State Mock Pattern:**
```typescript
async function setupMockAuth(page: Page) {
  await page.addInitScript(() => {
    const mockAuthState = {
      state: {
        user: {
          id: 'test-user-id-12345',
          email: 'test@example.com',
          role: 'authenticated',
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
```

**What to Mock:**
- Auth state for bypassing login
- Browser storage for session persistence

**What NOT to Mock:**
- Supabase API calls (tests use real database)
- UI interactions (use real selectors)

## Fixtures and Factories

**Test Data:**
- Hardcoded test credentials in each spec file
- No shared fixtures directory
- Mock user/profile objects defined inline

**Test Credentials:**
```typescript
const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testtest'

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
```

**Location:**
- Test data defined at top of each spec file
- No centralized fixtures directory

## Coverage

**Requirements:** None enforced

**View Coverage:**
- Not configured (Playwright does not report code coverage by default)

**Note:** Unit test coverage not available (no Jest/Vitest configured)

## Test Types

**Unit Tests:**
- Not implemented
- No Jest/Vitest configuration detected
- Would be valuable for hooks, utilities, validation schemas

**Integration Tests:**
- Not explicitly separated
- E2E tests cover integration scenarios

**E2E Tests:**
- Primary testing approach
- Playwright with Chromium
- Tests full user flows through real browser
- Runs against local dev server (`http://localhost:5174`)

## Common Patterns

**Page Navigation:**
```typescript
test('should navigate to page', async ({ page }) => {
  await page.goto('/clients')
  await page.waitForURL('**/clients')
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
})
```

**Form Interaction:**
```typescript
test('should fill form', async ({ page }) => {
  const firstName = page.getByLabel(/first name/i)
  await expect(firstName).toBeVisible({ timeout: 10000 })
  await firstName.fill('John')
  await expect(firstName).toHaveValue('John')
})
```

**Select Component Testing:**
```typescript
test('should open and select from dropdown', async ({ page }) => {
  const selectTrigger = page.locator('button[role="combobox"]').first()
  await selectTrigger.click()

  const dropdown = page.locator('[data-radix-select-content]')
  await expect(dropdown).toBeVisible({ timeout: 3000 })

  const options = dropdown.locator('[data-radix-select-item]')
  const count = await options.count()
  if (count > 0) {
    await options.first().click()
  }
})
```

**Tab Switching:**
```typescript
test('should switch tabs', async ({ page }) => {
  const tabs = ['Active', 'Preferred', 'Inactive', 'All']
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') })
    await tab.click()
    await page.waitForTimeout(300)
    await expect(tab).toHaveAttribute('data-state', 'active')
  }
})
```

**Error Checking:**
```typescript
async function checkNoErrors(page: Page) {
  const errorBoundary = page.getByText('Something went wrong')
  const hasError = await errorBoundary.isVisible().catch(() => false)
  if (hasError) {
    throw new Error(`Page has error`)
  }
}
```

**Async Testing:**
```typescript
test('should wait for data load', async ({ page }) => {
  await page.goto('/clients')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000) // Allow async renders
})
```

## Playwright Configuration

**From `apps/admin/playwright.config.ts`:**
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,          // Sequential execution
  forbidOnly: !!process.env.CI,  // Fail on .only in CI
  retries: process.env.CI ? 2 : 0,
  workers: 1,                    // Single worker
  reporter: 'html',
  timeout: 60000,                // 60s per test
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
```

**Key Settings:**
- Single project (Chromium only)
- Sequential test execution (not parallel)
- Auto-starts dev server if not running
- 60-second test timeout
- Screenshots and video on failure

## Test Selectors

**Preferred Selectors (in order):**
1. `getByRole()` - Accessibility-based (buttons, links, headings)
2. `getByLabel()` - Form inputs by label
3. `getByText()` - Text content
4. `getByPlaceholder()` - Input placeholders
5. `locator()` - CSS selectors as fallback

**Radix UI Component Selectors:**
```typescript
// Select triggers
page.locator('button[role="combobox"]')

// Select content
page.locator('[data-radix-select-content]')

// Select items
page.locator('[data-radix-select-item]')

// Tabs
page.getByRole('tab', { name: /active/i })

// Dialogs
page.locator('[role="dialog"]')
page.getByRole('dialog')

// Dropdown menus
page.locator('[data-radix-dropdown-menu-content]')
```

## Test Output

**Results Location:**
- HTML report: `apps/admin/playwright-report/`
- Screenshots: `apps/admin/test-results/`
- Videos: `apps/admin/test-results/`

**View Results:**
```bash
cd apps/admin
npx playwright show-report
```

## Adding New Tests

**When adding a new feature:**
1. Add page health check to `all-pages-health.spec.ts`
2. Add interaction tests to appropriate spec file
3. Use existing helper functions (`login`, `checkNoErrors`)
4. Follow `test.describe` grouping by module
5. Test both happy path and error states

**New Spec File Template:**
```typescript
import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testtest'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard', { timeout: 30000 })
}

async function checkNoErrors(page: Page) {
  const errorBoundary = page.getByText('Something went wrong')
  const hasError = await errorBoundary.isVisible().catch(() => false)
  if (hasError) {
    throw new Error(`Page has error`)
  }
}

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load page without errors', async ({ page }) => {
    await page.goto('/new-feature')
    await checkNoErrors(page)
    await expect(page.getByRole('heading', { name: 'New Feature' })).toBeVisible()
  })

  test('should perform main action', async ({ page }) => {
    await page.goto('/new-feature')
    // Add test steps
  })
})
```

---

*Testing analysis: 2026-01-19*

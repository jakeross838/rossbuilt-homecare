import { chromium } from '@playwright/test';

const BASE_URL = 'https://rossbuilt-homecare.vercel.app';

async function debugLiveApp() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[ERROR] ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(`[WARN] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  console.log('=== Testing Live App ===\n');

  try {
    // 1. Test main dashboard
    console.log('1. Loading main dashboard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-screenshots/01-dashboard.png', fullPage: true });
    console.log('   Screenshot saved: 01-dashboard.png');

    if (consoleErrors.length > 0) {
      console.log('   Console errors on dashboard:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 2. Test Properties tab
    console.log('\n2. Testing Properties tab...');
    consoleErrors.length = 0;
    const propertiesTab = page.locator('button:has-text("Properties")').first();
    if (await propertiesTab.isVisible()) {
      await propertiesTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-screenshots/02-properties.png', fullPage: true });
      console.log('   Screenshot saved: 02-properties.png');
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Properties:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 3. Test Clients tab
    console.log('\n3. Testing Clients tab...');
    consoleErrors.length = 0;
    const clientsTab = page.locator('button:has-text("Clients")').first();
    if (await clientsTab.isVisible()) {
      await clientsTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-screenshots/03-clients.png', fullPage: true });
      console.log('   Screenshot saved: 03-clients.png');
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Clients:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 4. Test Service Plans & Settings
    console.log('\n4. Testing Service Plans & Settings...');
    consoleErrors.length = 0;
    const servicePlansBtn = page.locator('button:has-text("Service Plans")').first();
    if (await servicePlansBtn.isVisible()) {
      await servicePlansBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'debug-screenshots/04-service-plans.png', fullPage: true });
      console.log('   Screenshot saved: 04-service-plans.png');
    } else {
      console.log('   Service Plans button not found, trying alternative...');
      const altBtn = page.locator('text=Service Plans').first();
      if (await altBtn.isVisible()) {
        await altBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-screenshots/04-service-plans.png', fullPage: true });
      }
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Service Plans:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 5. Test Billing & Invoices
    console.log('\n5. Testing Billing & Invoices...');
    consoleErrors.length = 0;
    const billingBtn = page.locator('button:has-text("Billing")').first();
    if (await billingBtn.isVisible()) {
      await billingBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'debug-screenshots/05-billing.png', fullPage: true });
      console.log('   Screenshot saved: 05-billing.png');
    } else {
      console.log('   Billing button not found, trying alternative...');
      const altBtn = page.locator('text=Billing').first();
      if (await altBtn.isVisible()) {
        await altBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-screenshots/05-billing.png', fullPage: true });
      }
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Billing:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 6. Test Analytics Dashboard
    console.log('\n6. Testing Analytics Dashboard...');
    consoleErrors.length = 0;
    const analyticsBtn = page.locator('button:has-text("Analytics")').first();
    if (await analyticsBtn.isVisible()) {
      await analyticsBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'debug-screenshots/06-analytics.png', fullPage: true });
      console.log('   Screenshot saved: 06-analytics.png');
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Analytics:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 7. Test Vendors tab
    console.log('\n7. Testing Vendors tab...');
    consoleErrors.length = 0;
    const vendorsTab = page.locator('button:has-text("Vendors")').first();
    if (await vendorsTab.isVisible()) {
      await vendorsTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-screenshots/07-vendors.png', fullPage: true });
      console.log('   Screenshot saved: 07-vendors.png');
    }

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Vendors:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    // 8. Test Client Portal
    console.log('\n8. Testing Client Portal...');
    consoleErrors.length = 0;
    await page.goto(`${BASE_URL}/portal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-screenshots/08-portal.png', fullPage: true });
    console.log('   Screenshot saved: 08-portal.png');

    if (consoleErrors.length > 0) {
      console.log('   Console errors on Portal:');
      consoleErrors.forEach(e => console.log(`     ${e}`));
    }

    console.log('\n=== Test Complete ===');
    console.log(`\nTotal console errors collected: ${consoleErrors.length}`);
    console.log(`Total console warnings collected: ${consoleWarnings.length}`);

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'debug-screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugLiveApp().catch(console.error);

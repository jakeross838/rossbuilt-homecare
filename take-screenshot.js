const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Click on Service Plans & Settings
  await page.click('text=Service Plans & Settings');
  await page.waitForTimeout(1500);
  
  await page.screenshot({ path: 'screenshot-settings.png', fullPage: false });
  console.log('Screenshot saved to screenshot-settings.png');
  
  await browser.close();
})();

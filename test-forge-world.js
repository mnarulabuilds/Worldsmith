/**
 * Test script: Landing page -> Forge World -> /world
 * Run: node test-forge-world.js
 */
const { chromium } = require('@playwright/test');

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      consoleErrors.push(text);
    }
    consoleLogs.push({ type, text });
  });

  try {
    console.log('1. Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });

    console.log('2. Typing "A forest with mountains" in the input...');
    const input = page.locator('input[type="text"]');
    await input.fill('A forest with mountains');

    console.log('3. Clicking "Forge World" button...');
    await page.getByRole('button', { name: 'Forge World' }).click();

    console.log('4. Waiting for navigation to /world...');
    await page.waitForURL('**/world**', { timeout: 15000 });

    const currentUrl = page.url();
    const navigatedToWorld = currentUrl.includes('/world');

    console.log('5. Waiting 3 seconds for page to fully render...');
    await page.waitForTimeout(3000);

    console.log('6. Taking screenshot...');
    await page.screenshot({ path: 'test-world-screenshot.png', fullPage: true });

    // Get page content for description
    const bodyText = await page.locator('body').innerText();
    const hasLoading = bodyText.includes('Loading') || bodyText.includes('Initializing');
    const hasWhiteScreen = await page.evaluate(() => {
      const body = document.body;
      const bg = window.getComputedStyle(body).backgroundColor;
      const children = body.children.length;
      return bg === 'rgb(255, 255, 255)' && children < 3;
    });

    console.log('\n========== TEST REPORT ==========');
    console.log('1. Did the page navigate to /world?', navigatedToWorld ? 'YES' : 'NO');
    console.log('   Current URL:', currentUrl);
    console.log('\n2. Page content summary:');
    console.log('   - Has "Loading" or "Initializing" text:', hasLoading);
    console.log('   - Body text length:', bodyText.length, 'chars');
    console.log('\n3. Console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e, i) => console.log(`   Error ${i + 1}:`, e));
    }
    console.log('\n4. White screen / crash?', hasWhiteScreen ? 'POSSIBLE' : 'NO');
    console.log('\n5. All console messages:');
    consoleLogs.forEach((l) => console.log(`   [${l.type}]`, l.text));
    console.log('\nScreenshot saved to: test-world-screenshot.png');
  } catch (err) {
    console.error('Test failed:', err.message);
    try {
      await page.screenshot({ path: 'test-world-screenshot-error.png', fullPage: true });
      console.log('Error screenshot saved to: test-world-screenshot-error.png');
    } catch (_) {}
    console.log('\nConsole errors captured:', consoleErrors);
  } finally {
    await browser.close();
  }
}

runTest();

#!/usr/bin/env node
import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * UI verification script using Playwright
 * This can be run to check UI changes across different browsers
 */

interface CheckOptions {
  url?: string;
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  viewport?: { width: number; height: number };
  screenshotDir?: string;
  waitForSelector?: string;
}

class UIChecker {
  private screenshotDir: string;

  constructor(screenshotDir = './playwright-screenshots') {
    this.screenshotDir = screenshotDir;
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async checkPage(options: CheckOptions = {}) {
    const {
      url = 'http://localhost:3000',
      browsers = ['chromium'],
      viewport = { width: 1280, height: 720 },
      waitForSelector
    } = options;

    const results: Array<{ browser: string; success: boolean; error?: string; screenshot?: string }> = [];

    for (const browserName of browsers) {
      let browser: Browser | null = null;
      let page: Page | null = null;

      try {
        console.log(`\n🔍 Checking UI in ${browserName}...`);
        
        // Launch browser
        switch (browserName) {
          case 'chromium':
            browser = await chromium.launch({ headless: false });
            break;
          case 'firefox':
            browser = await firefox.launch({ headless: false });
            break;
          case 'webkit':
            browser = await webkit.launch({ headless: false });
            break;
        }

        if (!browser) throw new Error(`Unknown browser: ${browserName}`);

        // Create page and set viewport
        page = await browser.newPage();
        await page.setViewportSize(viewport);

        // Navigate to URL
        console.log(`   📍 Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for specific selector if provided
        if (waitForSelector) {
          console.log(`   ⏳ Waiting for selector: ${waitForSelector}`);
          await page.waitForSelector(waitForSelector, { timeout: 10000 });
        }

        // Take screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(this.screenshotDir, `${browserName}-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`   📸 Screenshot saved: ${screenshotPath}`);

        // Check for console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.log(`   ❌ Console error: ${msg.text()}`);
          }
        });

        // Wait a bit to observe the page
        await page.waitForTimeout(2000);

        results.push({
          browser: browserName,
          success: true,
          screenshot: screenshotPath
        });

        console.log(`   ✅ ${browserName} check completed successfully`);

      } catch (error) {
        console.error(`   ❌ Error in ${browserName}:`, error);
        results.push({
          browser: browserName,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        if (page) await page.close();
        if (browser) await browser.close();
      }
    }

    return results;
  }

  async checkResponsiveness(url = 'http://localhost:3000') {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ];

    console.log('\n📱 Checking responsiveness across different viewports...\n');

    for (const viewport of viewports) {
      console.log(`Checking ${viewport.name} (${viewport.width}x${viewport.height})`);
      await this.checkPage({
        url,
        browsers: ['chromium'],
        viewport: { width: viewport.width, height: viewport.height }
      });
    }
  }

  async checkAccessibility(url = 'http://localhost:3000') {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      console.log('\n♿ Running accessibility checks...\n');
      await page.goto(url, { waitUntil: 'networkidle' });

      // Check for alt text on images
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.alt).map(img => img.src);
      });

      if (imagesWithoutAlt.length > 0) {
        console.log('   ⚠️  Images without alt text:', imagesWithoutAlt);
      }

      // Check for proper heading hierarchy
      const headings = await page.evaluate(() => {
        const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headingElements.map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        }));
      });

      console.log('   📝 Heading structure:', headings);

      // Check for form labels
      const inputsWithoutLabels = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        return inputs.filter(input => {
          const id = input.id;
          if (!id) return true;
          const label = document.querySelector(`label[for="${id}"]`);
          return !label;
        }).map(input => input.outerHTML);
      });

      if (inputsWithoutLabels.length > 0) {
        console.log('   ⚠️  Form elements without labels:', inputsWithoutLabels.length);
      }

      console.log('   ✅ Accessibility check completed');

    } finally {
      await browser.close();
    }
  }
}

// CLI usage
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  const checker = new UIChecker();
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  const url = args[1] || 'http://localhost:3000';

  (async () => {
    try {
      switch (command) {
        case 'check':
          await checker.checkPage({ url, browsers: ['chromium', 'firefox', 'webkit'] });
          break;
        case 'responsive':
          await checker.checkResponsiveness(url);
          break;
        case 'accessibility':
          await checker.checkAccessibility(url);
          break;
        default:
          console.log(`
Usage: npx tsx scripts/ui-check.ts [command] [url]

Commands:
  check         - Check UI in all browsers (default)
  responsive    - Check responsiveness across viewports
  accessibility - Run accessibility checks

Example:
  npx tsx scripts/ui-check.ts check http://localhost:3000/companies
          `);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}

export { UIChecker };
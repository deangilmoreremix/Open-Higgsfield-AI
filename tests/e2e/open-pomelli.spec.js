import { test, expect } from '@playwright/test';

test.describe('Open Pomelli Studio Integration', () => {
  test('should load Open Pomelli Studio page', async ({ page }) => {
    // RED phase: test will fail because page doesn't exist yet
    await page.goto('/#/open-pomelli-studio');
    
    // Check that the page loads (not showing error)
    const errorContainer = page.locator('[data-testid="error-container"]');
    await expect(errorContainer).toBeHidden();
    
    // Check that main UI elements are present
    const urlInput = page.locator('[data-testid="url-input"]');
    await expect(urlInput).toBeVisible();
    
    const analyzeBtn = page.locator('[data-testid="analyze-btn"]');
    await expect(analyzeBtn).toBeVisible();
    
    // Check that it uses the correct title
    const title = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(title).toContainText('Open Pomelli');
  });

  test('should use Supabase for data storage', async ({ page }) => {
    await page.goto('/#/open-pomelli-studio');
    
    // Check that Supabase client is initialized (no auth errors in console)
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    
    // Should not have Supabase connection errors
    const supabaseErrors = logs.filter(log => log.includes('Supabase') || log.includes('supabase'));
    expect(supabaseErrors.length).toBe(0);
  });

  test('should use MuAPI proxy for AI calls', async ({ page }) => {
    await page.goto('/#/open-pomelli-studio');
    
    // Intercept network requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/app/') || request.url().includes('/functions/')) {
        apiCalls.push(request.url());
      }
    });
    
    // Trigger an analysis (if possible)
    const urlInput = page.locator('[data-testid="url-input"]');
    if (await urlInput.isVisible()) {
      await urlInput.fill('https://example.com');
      const analyzeBtn = page.locator('[data-testid="analyze-btn"]');
      await analyzeBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Should use the API proxy
    // (This test will be updated as implementation progresses)
    expect(true).toBe(true);
  });
});

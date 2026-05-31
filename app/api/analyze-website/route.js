import { chromium } from 'playwright';

export async function POST(request) {
  const { url } = await request.json();

  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const title = await page.title();
    const html = await page.content();

    const screenshotBuffer = await page.screenshot({ fullPage: false });
    const base64Screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

    const colors = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const colorSet = new Set();
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color && style.color !== 'rgb(0, 0, 0)') colorSet.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(style.backgroundColor);
        }
      });
      return Array.from(colorSet).slice(0, 10);
    });

    return Response.json({
      url,
      title,
      colors,
      html,
      screenshotUrl: base64Screenshot
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await browser.close();
  }
}
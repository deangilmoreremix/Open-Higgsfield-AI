import { NextResponse } from 'next/server';

const MUAPI_BASE = 'https://api.muapi.ai';

function getApiKey(request) {
  const headerKey = request.headers.get('x-api-key');
  if (headerKey) return headerKey;
  const cookieKey = request.cookies.get('muapi_key')?.value;
  return cookieKey;
}

export async function POST(request) {
  const { url } = await request.json();
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // For now, return a basic screenshot using thum.io as fallback
  // In production, integrate with FireCrawl or similar service
  const screenshot = `https://image.thum.io/get/width/1200/height/800/${encodeURIComponent(url)}`;

  return NextResponse.json({
    url,
    title: 'Website',
    description: '',
    screenshot,
    og_image: null,
    favicon: null
  });
}
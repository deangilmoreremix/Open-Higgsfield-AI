import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key');
  const payload = await request.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 400 });
  }
  if (!payload || Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'Missing or empty payload' }, { status: 400 });
  }

  try {
    const muApiUrl = 'https://api.muapi.ai/api/v1/generate_wan_ai_effects';
    const muApiRes = await fetch(muApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await muApiRes.json();
    return NextResponse.json(data, { status: muApiRes.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const muApiStatusUrl = `https://api.muapi.ai/api/v1/predictions/${id}/result`;
  try {
    const muApiRes = await fetch(muApiStatusUrl, {
      headers: { 'x-api-key': apiKey },
    });
    const data = await muApiRes.json();
    return NextResponse.json(data, { status: muApiRes.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
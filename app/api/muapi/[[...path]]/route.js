import { NextResponse } from 'next/server';

const MUAPI_BASE = 'https://api.muapi.ai';

export async function GET(request, { params }) {
  const { path } = await params;
  const targetPath = path ? path.join('/') : '';
  const url = new URL(request.url);
  const targetUrl = `${MUAPI_BASE}/${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const apiKey = request.headers.get('x-api-key') || request.cookies.get('muapi_key')?.value;
  if (apiKey) headers.set('x-api-key', apiKey);

  try {
    const res = await fetch(targetUrl, { method: 'GET', headers });
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { path } = await params;
  const targetPath = path ? path.join('/') : '';
  const url = new URL(request.url);
  const targetUrl = `${MUAPI_BASE}/${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const apiKey = request.headers.get('x-api-key') || request.cookies.get('muapi_key')?.value;
  if (apiKey) headers.set('x-api-key', apiKey);

  try {
    const body = await request.arrayBuffer();
    const res = await fetch(targetUrl, { method: 'POST', headers, body });
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { path } = await params;
  const targetPath = path ? path.join('/') : '';
  const url = new URL(request.url);
  const targetUrl = `${MUAPI_BASE}/${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const apiKey = request.headers.get('x-api-key') || request.cookies.get('muapi_key')?.value;
  if (apiKey) headers.set('x-api-key', apiKey);

  try {
    const res = await fetch(targetUrl, { method: 'DELETE', headers });
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
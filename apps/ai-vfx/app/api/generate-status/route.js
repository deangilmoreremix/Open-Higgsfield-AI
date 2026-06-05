import { NextResponse } from 'next/server';
import { vadooAPI } from '../../../lib/vadoo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  try {
    const status = await vadooAPI.getGenerationStatus(id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching video status:', error);
    return NextResponse.json({ error: 'Failed to fetch video status' }, { status: 500 });
  }
}
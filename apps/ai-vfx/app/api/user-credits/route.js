import { NextResponse } from 'next/server';
import { vadooAPI } from '../../../lib/vadoo';

export async function GET(request) {
  try {
    const credits = await vadooAPI.getUserCredits();
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Failed to fetch user credits' }, { status: 500 });
  }
}
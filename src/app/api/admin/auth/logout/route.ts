import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ENV.ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Delete immediately
    path: '/',
  });
  return response;
}

// This endpoint has been moved to /api/admin/upload for proper auth enforcement.
// Keeping this file to avoid 404s from any cached links — it now just returns 410 Gone.
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has moved to /api/admin/upload' },
    { status: 410 }
  );
}

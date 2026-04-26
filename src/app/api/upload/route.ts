import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@/lib/env';

const R2 = new S3Client({
  region: 'auto',
  endpoint: ENV.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'R2 credentials not configured — add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to Vercel environment variables' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await R2.send(
      new PutObjectCommand({
        Bucket: ENV.R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000',
      })
    );

    const url = `${ENV.R2_PUBLIC_URL}/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('R2 upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

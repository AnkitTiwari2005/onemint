import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@/lib/env';
import { cookies } from 'next/headers';

// R2 client — uses ENV wrapper (consistent with all other routes)
function makeR2Client() {
  if (!ENV.R2_ACCESS_KEY_ID || !ENV.R2_SECRET_ACCESS_KEY || !ENV.R2_ENDPOINT) {
    return null;
  }
  return new S3Client({
    region: 'auto',
    endpoint: ENV.R2_ENDPOINT,
    credentials: {
      accessKeyId: ENV.R2_ACCESS_KEY_ID,
      secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function POST(req: NextRequest) {
  // Issue #14: guard uploads — only authenticated admins may store files
  const cookieStore = await cookies();
  const session = cookieStore.get(ENV.ADMIN_SESSION_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const R2 = makeR2Client();
    if (!R2) {
      return NextResponse.json(
        { error: 'R2 not configured — add R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_ENDPOINT to env vars' },
        { status: 503 }
      );
    }

    if (!ENV.R2_BUCKET) {
      return NextResponse.json({ error: 'R2_BUCKET_NAME not configured' }, { status: 503 });
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

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
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
    console.error('[R2 upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

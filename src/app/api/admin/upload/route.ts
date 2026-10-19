import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@/lib/env';

// R2 client
function makeR2Client() {
  if (!ENV.R2_ACCESS_KEY_ID || !ENV.R2_SECRET_ACCESS_KEY || !ENV.R2_ENDPOINT) return null;
  return new S3Client({
    region: 'auto',
    endpoint: ENV.R2_ENDPOINT,
    credentials: {
      accessKeyId: ENV.R2_ACCESS_KEY_ID,
      secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
    },
  });
}

// This route is protected by middleware (matcher: /api/admin/:path*)
// No extra auth check needed — the middleware validates the HMAC session token.
export async function POST(req: NextRequest) {
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

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic-byte validation — trust content, not just MIME/extension
    const isPNG  = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isJPEG = buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isWebP = buffer.length >= 12 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    const isGIF  = buffer.length >= 6 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61;
    if (!isPNG && !isJPEG && !isWebP && !isGIF) {
      return NextResponse.json(
        { error: 'Invalid image format. Only PNG, JPEG, WebP, and GIF are accepted.' },
        { status: 400 }
      );
    }
    // Derive extension and content-type from verified magic bytes — never trust user-supplied filename or MIME
    const ext = isPNG ? 'png' : isJPEG ? 'jpg' : isWebP ? 'webp' : 'gif';
    const mimeType = isPNG ? 'image/png' : isJPEG ? 'image/jpeg' : isWebP ? 'image/webp' : 'image/gif';
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await R2.send(
      new PutObjectCommand({
        Bucket: ENV.R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
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

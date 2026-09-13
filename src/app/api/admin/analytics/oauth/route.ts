/**
 * GET /api/admin/analytics/oauth?action=start  → redirects to Google consent
 * GET /api/admin/analytics/oauth?code=xxx       → exchanges code, returns JSON
 *
 * This route is protected by middleware admin auth (session cookie required).
 * Used once during setup to obtain a GA4 refresh token.
 *
 * Add these redirect URIs in Google Cloud Console → Credentials → OAuth client:
 *   http://localhost:3000/api/admin/analytics/oauth
 *   https://www.onemint.in/api/admin/analytics/oauth
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCleanEnv } from '@/lib/env';

const CLIENT_ID     = getCleanEnv('GA4_CLIENT_ID');
const CLIENT_SECRET = getCleanEnv('GA4_CLIENT_SECRET');
const SCOPE         = 'https://www.googleapis.com/auth/analytics.readonly';

function getRedirectUri(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  return `${proto}://${host}/api/admin/analytics/oauth`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const code   = searchParams.get('code');

  // ── Start: redirect to Google consent ──────────────────────────────────────
  if (action === 'start') {
    const redirectUri = getRedirectUri(req);
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id',     CLIENT_ID);
    authUrl.searchParams.set('redirect_uri',  redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope',         SCOPE);
    authUrl.searchParams.set('access_type',   'offline');
    authUrl.searchParams.set('prompt',        'consent'); // forces refresh_token
    return NextResponse.redirect(authUrl.toString());
  }

  // ── Callback: exchange code for refresh_token ──────────────────────────────
  if (code) {
    const redirectUri = getRedirectUri(req);
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri:  redirectUri,
          grant_type:    'authorization_code',
        }),
      });
      const json = await tokenRes.json();

      if (json.refresh_token) {
        // Return a styled HTML page with a copyable token box.
        // Token stays out of the URL (no access log leakage) and out of raw JSON.
        const token = json.refresh_token as string;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>GA4 OAuth — Token Ready</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0f1117;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#1a1d27;border:1px solid #2d3148;border-radius:12px;padding:32px;max-width:680px;width:100%}
    h1{font-size:1.25rem;font-weight:600;margin-bottom:8px;color:#a3e635}
    p{font-size:.9rem;color:#94a3b8;margin-bottom:20px;line-height:1.6}
    label{font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#64748b;display:block;margin-bottom:6px}
    .token-box{background:#0d1117;border:1px solid #2d3148;border-radius:8px;padding:14px 16px;font-family:monospace;font-size:.78rem;word-break:break-all;color:#7dd3fc;line-height:1.6;margin-bottom:16px;user-select:all}
    button{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:.9rem;font-weight:600;cursor:pointer;transition:background .2s}
    button:hover{background:#2563eb}
    button.copied{background:#16a34a}
    .step{background:#1e2535;border-radius:8px;padding:16px;margin-top:20px;font-size:.85rem;color:#94a3b8;line-height:1.8}
    .step strong{color:#e2e8f0}
    code{background:#0d1117;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.8rem;color:#fbbf24}
  </style>
</head>
<body>
<div class="card">
  <h1>✅ GA4 Refresh Token Ready</h1>
  <p>Copy the token below and save it as <code>GA4_REFRESH_TOKEN</code> in your Hostinger environment variables.</p>
  <label>GA4_REFRESH_TOKEN</label>
  <div class="token-box" id="token">${token}</div>
  <button onclick="copyToken()" id="btn">Copy Token</button>
  <div class="step">
    <strong>Next steps:</strong><br>
    1. Copy the token above<br>
    2. Go to <strong>hPanel → Websites → Manage → Advanced → Environment Variables</strong><br>
    3. Update <code>GA4_REFRESH_TOKEN</code> with this value<br>
    4. Also update your local <code>.env.local</code> file<br>
    5. Restart the app — analytics will start working immediately
  </div>
</div>
<script>
function copyToken(){
  const text=document.getElementById('token').innerText;
  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('btn');
    btn.textContent='Copied!';
    btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='Copy Token';btn.classList.remove('copied')},2500);
  });
}
</script>
</body>
</html>`;
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      return NextResponse.json(
        { error: 'No refresh_token in response. Did you set prompt=consent?', raw: json },
        { status: 400 }
      );
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Pass ?action=start or ?code=...' }, { status: 400 });
}

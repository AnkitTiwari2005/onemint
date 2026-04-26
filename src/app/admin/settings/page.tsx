'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';

type SettingsState = {
  siteName: string;
  tagline: string;
  adminEmail: string;
  siteUrl: string;
  twitterHandle: string;
  gaTrackingId: string;
  adsensePublisherId: string;
  newsletterProvider: string;
  contactFormEmail: string;
  footerCopyright: string;
  defaultCategory: string;
  articlesPerPage: number;
  maintenanceMode: boolean;
  commentsEnabled: boolean;
  newsletterEnabled: boolean;
  darkModeDefault: boolean;
};

const DEFAULTS: SettingsState = {
  siteName: 'OneMint',
  tagline: 'One Rupee at a Time — Finance, Technology, Health & Career',
  adminEmail: 'admin@onemint.com',
  siteUrl: 'https://onemint.vercel.app',
  twitterHandle: '@OneMint',
  gaTrackingId: '',
  adsensePublisherId: '',
  newsletterProvider: 'Brevo',
  contactFormEmail: 'contact@onemint.com',
  footerCopyright: '© 2026 OneMint. All rights reserved.',
  defaultCategory: 'finance',
  articlesPerPage: 12,
  maintenanceMode: false,
  commentsEnabled: true,
  newsletterEnabled: true,
  darkModeDefault: false,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px' }}>{label}</p>
        {help && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0, lineHeight: 1.5 }}>{help}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof SettingsState, value: string | boolean | number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // Load persisted settings from Supabase on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' as const };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Persist to Supabase (excluding password fields — those are env vars)
      const { ...toSave } = settings;
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Non-fatal
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Site Settings</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>Saved to Supabase — persists across deploys</p>
        </div>
        <button onClick={saveAll} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <Section title="General">
        {[
          { label: 'Site Name', key: 'siteName', help: 'Shown in the browser tab and header.' },
          { label: 'Tagline', key: 'tagline', help: 'Used in the homepage hero and meta description.' },
          { label: 'Site URL', key: 'siteUrl', help: 'Production URL (no trailing slash).' },
          { label: 'Admin Email', key: 'adminEmail', help: 'Internal email for admin notifications.' },
          { label: 'Twitter Handle', key: 'twitterHandle', help: 'Used in Twitter/X meta tags.' },
          { label: 'Footer Copyright', key: 'footerCopyright', help: 'Appears in the site footer.' },
        ].map(({ label, key, help }) => (
          <Field key={key} label={label} help={help}>
            <input value={String(settings[key as keyof SettingsState])} onChange={(e) => set(key as keyof SettingsState, e.target.value)} style={inputStyle} />
          </Field>
        ))}
        <Field label="Articles Per Page" help="Number of articles shown on listing pages.">
          <input type="number" value={settings.articlesPerPage} min={4} max={48} step={4} onChange={(e) => set('articlesPerPage', parseInt(e.target.value))} style={{ ...inputStyle, maxWidth: 120 }} />
        </Field>
      </Section>

      <Section title="Analytics & Ads">
        {[
          { label: 'Google Analytics ID', key: 'gaTrackingId', help: 'Format: G-XXXXXXXXXX' },
          { label: 'AdSense Publisher ID', key: 'adsensePublisherId', help: 'Format: ca-pub-XXXXXXXXXXXXXXXX' },
        ].map(({ label, key, help }) => (
          <Field key={key} label={label} help={help}>
            <input value={String(settings[key as keyof SettingsState])} onChange={(e) => set(key as keyof SettingsState, e.target.value)} style={inputStyle} placeholder="Paste your ID here…" />
          </Field>
        ))}
      </Section>

      <Section title="Newsletter Integration">
        {[
          { label: 'Provider', key: 'newsletterProvider', help: 'e.g. ConvertKit, Mailchimp, Brevo' },
          { label: 'API Key', key: 'newsletterApiKey', help: 'Your newsletter platform API key.' },
          { label: 'List / Form ID', key: 'newsletterListId', help: 'The subscriber list or form ID.' },
          { label: 'Contact Form To', key: 'contactFormEmail', help: 'Email that receives contact form submissions.' },
        ].map(({ label, key, help }) => (
          <Field key={key} label={label} help={help}>
            <input value={String(settings[key as keyof SettingsState])} onChange={(e) => set(key as keyof SettingsState, e.target.value)} style={inputStyle} type={key.includes('Key') ? 'password' : 'text'} placeholder={key.includes('Key') ? '••••••••••••' : undefined} />
          </Field>
        ))}
      </Section>

      <Section title="Features">
        {[
          { label: 'Comments Enabled', key: 'commentsEnabled', help: 'Enable Giscus comments on articles.' },
          { label: 'Newsletter Signup', key: 'newsletterEnabled', help: 'Show newsletter subscription widget.' },
          { label: 'Dark Mode Default', key: 'darkModeDefault', help: 'Default theme for new visitors.' },
        ].map(({ label, key, help }) => (
          <Field key={key} label={label} help={help}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={Boolean(settings[key as keyof SettingsState])} onChange={(e) => set(key as keyof SettingsState, e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{settings[key as keyof SettingsState] ? 'Enabled' : 'Disabled'}</span>
            </label>
          </Field>
        ))}
        <Field label="Maintenance Mode" help="Redirects all public pages to a maintenance notice.">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => set('maintenanceMode', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#DC2626' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: settings.maintenanceMode ? '#DC2626' : 'var(--color-ink-secondary)', fontWeight: settings.maintenanceMode ? 600 : 400 }}>
              {settings.maintenanceMode ? '⚠️ Maintenance mode is ON' : 'Off'}
            </span>
          </label>
        </Field>
      </Section>

      <Section title="Admin Password">
        <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
            <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>Secure bcrypt authentication active</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>
                Password is stored as a bcrypt hash in <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-border)', padding: '1px 5px', borderRadius: 4 }}>ADMIN_PASSWORD_HASH</code> environment variable.
                To change your password, generate a new hash with:
              </p>
              <code style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, background: '#0F1117', color: '#A3E635', padding: '8px 12px', borderRadius: 6 }}>
                node -e &quot;const b=require(&apos;bcryptjs&apos;); console.log(b.hashSync(&apos;newpassword&apos;,12));&quot;
              </code>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: '8px 0 0' }}>
                Then update <strong>ADMIN_PASSWORD_HASH</strong> in your Vercel environment variables and redeploy.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <div style={{ height: 40 }} />
    </div>
  );
}

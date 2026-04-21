'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';



export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || 'onemint2025';
    if (password === storedPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      router.push('/admin');
    } else {
      setError('Incorrect password. Please try again.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 24,
      }}
    >
      <motion.div
        animate={shaking ? { x: [-12, 12, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 40,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={22} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 6px' }}>
            OneMint Admin
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            Content Management Panel
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Password field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '11px 44px 11px 14px',
                  borderRadius: 8, border: `1px solid ${error ? '#DC2626' : 'var(--color-border)'}`,
                  background: 'var(--color-surface-alt)',
                  fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>{error}</p>}
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px',
              borderRadius: 8, border: 'none',
              background: 'var(--color-accent)', color: 'white',
              fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'opacity 0.15s ease',
            }}
          >
            Sign In
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0, textAlign: 'center' }}>
            🔑 Demo credentials: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>onemint2025</strong>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

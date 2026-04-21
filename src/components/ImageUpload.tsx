'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Featured Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }

    setUploading(true);
    setError('');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setError(data.error || 'Upload failed — check R2 credentials in env vars');
      }
    } catch {
      setError('Upload failed — check your connection');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
        {label}
      </p>

      {value ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '42%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <Image
            src={value}
            alt="Featured"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized={value.startsWith('http') && !value.includes('r2.dev')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 8, right: 8, width: 28, height: 28,
              borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} color="white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          style={{
            border: '2px dashed var(--color-border)', borderRadius: 8,
            padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
            background: 'var(--color-surface-alt)',
            transition: 'border-color 0.15s ease',
          }}
        >
          {uploading ? (
            <>
              <Loader2
                size={24}
                style={{ margin: '0 auto 8px', color: 'var(--color-accent)', display: 'block' }}
                className="animate-spin"
              />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: 0 }}>
                Uploading to R2…
              </p>
            </>
          ) : (
            <>
              <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--color-ink-tertiary)', display: 'block' }} />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: '0 0 4px' }}>
                Click or drag to upload image
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>
                PNG, JPG, WebP — max 10MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', marginTop: 6 }}>
          {error}
        </p>
      )}

      {/* Also allow direct URL input */}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL…"
        style={{
          width: '100%', marginTop: 8, padding: '8px 12px',
          borderRadius: 6, border: '1px solid var(--color-border)',
          background: 'var(--color-surface-alt)', fontSize: 13,
          color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box',
          fontFamily: 'var(--font-ui)',
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

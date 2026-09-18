'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeCardProps {
  data: string;
  size?: number;
  title?: string;
  className?: string;
}

export function QrCodeCard({ data, size = 180, title, className = '' }: QrCodeCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [data, size]);

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs ${className}`}>
      {title && (
        <span className="text-[11px] font-semibold text-slate-600 mb-2 tracking-wide uppercase">
          {title}
        </span>
      )}
      {qrUrl ? (
        <img
          src={qrUrl}
          alt={title || 'Digital Gate Pass QR'}
          width={size}
          height={size}
          className="rounded-lg"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 animate-pulse"
        >
          Generating QR...
        </div>
      )}
    </div>
  );
}

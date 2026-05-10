import React, { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSense({ slot, format = 'auto', layout, className = '', style }: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`adsense-container my-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center min-h-[100px] ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-9927699892416636"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { 'data-ad-layout': layout } : {})}
      />
      {/* Fallback label to maintain premium look even if ad doesn't load */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="text-[10px] font-mono tracking-[0.5em] uppercase">Patrocinado // Intel_Ads</span>
      </div>
    </div>
  );
}

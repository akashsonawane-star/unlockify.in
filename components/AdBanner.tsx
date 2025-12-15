import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId: string; // The ad slot ID from AdSense
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string; // For in-feed ads
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotId, format = 'auto', layoutKey }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle && process.env.NODE_ENV !== 'development') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div className="w-full my-6 flex justify-center bg-slate-50 border border-slate-100 rounded-lg overflow-hidden min-h-[100px] items-center text-xs text-slate-400">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', textAlign: 'center' }}
        data-ad-client="ca-pub-5400888645138874" 
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      >
      </ins>
      {/* Fallback label if ad doesn't load immediately */}
      <span className="hidden">Advertisement</span>
    </div>
  );
};

import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  withText?: boolean;
  theme?: 'light' | 'dark';
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "w-10 h-10", 
  withText = true, 
  theme = 'light',
  subtitle 
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="flex items-center gap-3 select-none group">
      <div className={`${className} rounded-2xl bg-gradient-to-br from-[#6E27FF] to-[#3F8CFF] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0 relative transition-transform group-hover:scale-110 duration-300`}>
        <Rocket className="w-[60%] h-[60%] fill-white/20" strokeWidth={2.5} />
        <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse-slow" />
        </div>
      </div>

      {withText && (
        <div className="flex flex-col justify-center">
          <h1 className={`text-xl font-bold font-heading tracking-tight leading-none ${textColor}`}>
            Unlockify<span className="text-[#6E27FF]">.in</span>
          </h1>
          {subtitle ? (
             <span className={`text-[10px] uppercase tracking-widest font-black ${subTextColor} mt-1`}>{subtitle}</span>
          ) : (
             <span className={`text-[10px] font-semibold ${subTextColor} tracking-wide mt-0.5 opacity-80`}>Growth for Local Brands</span>
          )}
        </div>
      )}
    </div>
  );
};

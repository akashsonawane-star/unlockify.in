
import React from 'react';
import { Lock } from 'lucide-react';

interface BrandLogoProps {
  className?: string; // Size of the icon container
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
    <div className="flex items-center gap-3 select-none">
      {/* Icon Container - Matching Brand Color #6E27FF */}
      <div className={`${className} rounded-2xl bg-[#6E27FF] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0`}>
        {/* Lock Icon representing the brand visual */}
        <Lock className="w-[50%] h-[50%] fill-white/20" strokeWidth={2.5} />
      </div>

      {/* Text */}
      {withText && (
        <div className="flex flex-col justify-center">
          <span className={`text-xl font-bold font-heading tracking-tight leading-none ${textColor}`}>
            unlockify<span className="text-[#6E27FF]">.in</span>
          </span>
          {subtitle ? (
             <span className={`text-[10px] uppercase tracking-widest font-semibold ${subTextColor} mt-0.5`}>{subtitle}</span>
          ) : (
             <span className={`text-[10px] font-medium ${subTextColor} tracking-wide -mt-0.5`}>a digital key</span>
          )}
        </div>
      )}
    </div>
  );
};

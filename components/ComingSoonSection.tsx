
import React from 'react';
import * as Icons from 'lucide-react';

interface Tool {
  title: string;
  desc: string;
  icon: keyof typeof Icons;
  color: string;
}

const TOOLS: Tool[] = [
  { title: "Business Poster Generator", desc: "AI-powered posters for offers, sales & events.", icon: "Layout", color: "purple" },
  { title: "Flyer Creator", desc: "Print-ready A4 flyers for marketing campaigns.", icon: "FileImage", color: "blue" },
  { title: "Digital Business Card", desc: "Smart AI business visiting card generator.", icon: "CreditCard", color: "pink" },
  { title: "Reel Cover Generator", desc: "High-engagement cover images with AI typography.", icon: "Image", color: "orange" },
  { title: "Insta Post Templates", desc: "Auto-designed posts with brand colors.", icon: "Grid", color: "indigo" },
  { title: "Menu / Price List", desc: "Beautiful menus & pricing sheets in 1 click.", icon: "FileText", color: "emerald" },
  { title: "Logo & Branding Pack", desc: "Instant logo concepts for new businesses.", icon: "PenTool", color: "cyan" },
  { title: "Offer Coupon Generator", desc: "Scannable coupon cards for WhatsApp.", icon: "Ticket", color: "red" },
  { title: "Social Banners", desc: "Facebook & YouTube cover banners.", icon: "Monitor", color: "teal" },
];

export const ComingSoonSection: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  return (
    <section className={`py-12 relative overflow-hidden rounded-3xl ${isDark ? 'bg-slate-900' : ''}`}>
      {/* Background Decor */}
      {!isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[500px] bg-gradient-to-r from-purple-200/30 via-blue-200/30 to-purple-200/30 blur-3xl rounded-full -z-10 opacity-60"></div>
      )}

      <div className="px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className={`text-2xl md:text-3xl font-heading font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Coming Soon — Premium Design Tools
          </h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm md:text-base`}>
            These advanced AI tools will unlock soon in the Growth Plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {TOOLS.map((tool, idx) => {
            const Icon = Icons[tool.icon] as React.ElementType;
            return (
              <div 
                key={idx}
                className={`relative group overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 select-none
                  ${isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-purple-500/10' 
                    : 'bg-white/60 border-white/50 hover:bg-white/80 hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5'
                  }
                `}
              >
                {/* Lock Icon Overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`p-1.5 rounded-full ${isDark ? 'bg-black/30' : 'bg-white/50'} backdrop-blur-sm border border-white/20`}>
                    <Icons.Lock className="w-4 h-4 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  </div>
                </div>

                <div className="p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br
                    ${tool.color === 'purple' ? 'from-purple-500 to-purple-700' : 
                      tool.color === 'blue' ? 'from-blue-500 to-blue-700' :
                      tool.color === 'pink' ? 'from-pink-500 to-pink-700' :
                      tool.color === 'orange' ? 'from-orange-500 to-orange-700' :
                      tool.color === 'indigo' ? 'from-indigo-500 to-indigo-700' :
                      tool.color === 'emerald' ? 'from-emerald-500 to-emerald-700' :
                      tool.color === 'cyan' ? 'from-cyan-500 to-cyan-700' :
                      tool.color === 'red' ? 'from-red-500 to-red-700' :
                      'from-teal-500 to-teal-700'}
                    shadow-lg opacity-90 group-hover:opacity-100 transition-opacity
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {tool.title}
                  </h3>
                  
                  <p className={`text-sm mb-6 flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tool.desc}
                  </p>

                  <div className="mt-auto">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${isDark 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                        : 'bg-purple-50 border-purple-100 text-purple-600'
                      }
                    `}>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      Coming Soon
                    </div>
                    <div className={`mt-2 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Available in Growth Plan
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { UserPlan } from '../types';
import * as Icons from 'lucide-react';

interface TopBarProps {
  userPlan: UserPlan;
  onPlanChange: (plan: UserPlan) => void;
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userPlan, onPlanChange, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
        >
          <Icons.Menu className="w-6 h-6" />
        </button>
        
        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 lg:w-96 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <Icons.Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search templates, history..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Plan Switcher (Simulation) */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
          <button
            onClick={() => onPlanChange('free')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              userPlan === 'free'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => onPlanChange('paid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center ${
              userPlan === 'paid'
                ? 'bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icons.Sparkles className="w-3 h-3 mr-1" />
            Growth
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Icons.Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Language Selector (Visual only) */}
        <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span>🇺🇸 EN</span>
        </div>

      </div>
    </header>
  );
};


import React from 'react';
import { FEATURES } from '../constants';
import { ViewState } from '../types';
import * as Icons from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-50">
            <BrandLogo className="w-10 h-10" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            
            {/* Dashboard Link */}
            <button
              onClick={() => { onViewChange('dashboard'); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-slate-50 text-[#6E27FF]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icons.LayoutGrid className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-[#6E27FF]' : 'text-slate-400'}`} />
              Dashboard
            </button>

            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Create Content
            </div>

            {FEATURES.map((feature) => {
              const Icon = Icons[feature.icon as keyof typeof Icons] || Icons.Circle;
              const isActive = currentView === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => { onViewChange(feature.id); onCloseMobile(); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#6E27FF]/10 to-[#3F8CFF]/10 text-[#6E27FF]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#6E27FF]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{feature.label}</span>
                  </div>
                  {feature.premium && (
                    <Icons.Lock className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              );
            })}

            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Library
            </div>

            <button
              onClick={() => { onViewChange('saved'); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'saved'
                  ? 'bg-slate-50 text-[#6E27FF]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icons.Bookmark className={`w-5 h-5 ${currentView === 'saved' ? 'text-[#6E27FF]' : 'text-slate-400'}`} />
              Saved Content
            </button>

          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => { onViewChange('profile'); onCloseMobile(); }}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700 truncate">Amit Sharma</div>
                <div className="text-xs text-slate-500 truncate">Manage Profile</div>
              </div>
              <Icons.Settings className={`w-4 h-4 ${currentView === 'profile' ? 'text-[#6E27FF]' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

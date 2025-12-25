import React from 'react';
import { ViewState, HistoryItem } from '../types';
import * as Icons from 'lucide-react';
import { FEATURES } from '../constants';
import { ComingSoonSection } from './ComingSoonSection';
import { AdBanner } from './AdBanner';

interface DashboardHomeProps {
  onNavigate: (view: ViewState) => void;
  recentHistory: HistoryItem[];
  userName?: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, recentHistory, userName }) => {
  // Get time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = userName || 'there';

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">{greeting}, {displayName}! 👋</h1>
        <p className="text-slate-500 mt-2">Ready to grow your local business today?</p>
      </div>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-slate-800">Quick Create</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           
           {/* Card 1: Instagram */}
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('instagram')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Instagram Post</h3>
              <p className="text-sm text-slate-500 mb-4">Generate catchy captions, hashtags, and viral hooks.</p>
              <button className="text-sm font-semibold text-[#6E27FF] flex items-center">
                Create Now <Icons.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           {/* Card 2: WhatsApp */}
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('whatsapp')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">WhatsApp Blast</h3>
              <p className="text-sm text-slate-500 mb-4">Send offers and updates to your loyal customers.</p>
              <button className="text-sm font-semibold text-[#6E27FF] flex items-center">
                Create Now <Icons.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           {/* Card 3: Festival */}
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onNavigate('festival')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.PartyPopper className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Festival Post</h3>
              <p className="text-sm text-slate-500 mb-4">Wishes and posters for upcoming Indian festivals.</p>
              <button className="text-sm font-semibold text-[#6E27FF] flex items-center">
                Create Now <Icons.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

        </div>
      </section>

      {/* AdSense Unit */}
      <AdBanner slotId="9337377427" />

      {/* Upgrade Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-heading">Unlock Unlimited Growth 🚀</h3>
            <p className="text-blue-100 max-w-lg">Get 30-day marketing calendars, GMB management, long-form content, and remove all daily limits.</p>
          </div>
          <button className="bg-white text-[#6E27FF] px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
            Upgrade to Growth
          </button>
        </div>
      </div>

      {/* Coming Soon Section */}
      <ComingSoonSection />

      {/* Recent Activity */}
      <section>
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-slate-800">Recent Generations</h2>
           <button onClick={() => onNavigate('saved')} className="text-sm text-[#6E27FF] hover:underline">View all</button>
        </div>
        
        {recentHistory.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icons.History className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No history yet</p>
            <p className="text-xs text-slate-400 mt-1">Your generated content will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.slice(0, 3).map((item) => {
               const feature = FEATURES.find(f => f.id === item.feature);
               return (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                     {feature ? <Icons.CheckCircle2 className="w-5 h-5" /> : <Icons.FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{feature?.label || 'Generated Content'}</h4>
                    <p className="text-xs text-slate-500 truncate">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="hidden sm:block text-xs font-mono bg-slate-50 px-2 py-1 rounded text-slate-500">
                    {item.feature.toUpperCase()}
                  </div>
                  <button className="p-2 text-slate-400 hover:text-[#6E27FF] rounded-full hover:bg-purple-50">
                    <Icons.ChevronRight className="w-5 h-5" />
                  </button>
                </div>
               );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
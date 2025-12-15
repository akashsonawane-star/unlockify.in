
import React, { useState } from 'react';
import { ViewState } from '../types';
import * as Icons from 'lucide-react';

interface NotificationPageProps {
  onNavigate: (view: ViewState) => void;
}

interface EventItem {
  id: string;
  name: string;
  date: string;
  desc: string;
  icon: keyof typeof Icons;
  color: string;
}

const UPCOMING_EVENTS: EventItem[] = [
  { id: '1', name: "Republic Day", date: "26 Jan", desc: "Patriotic posts & offers for Republic Day.", icon: "Flag", color: "text-orange-500" },
  { id: '2', name: "Shivaji Maharaj Jayanti", date: "19 Feb", desc: "Honor the legacy of Chhatrapati Shivaji Maharaj.", icon: "Crown", color: "text-red-600" },
  { id: '3', name: "Women's Day", date: "08 Mar", desc: "Celebrate women with special discounts.", icon: "Heart", color: "text-pink-500" },
  { id: '4', name: "Holi", date: "25 Mar", desc: "Colorful creative posts for the festival of colors.", icon: "Palette", color: "text-purple-500" },
  { id: '5', name: "Gudi Padwa", date: "09 Apr", desc: "Maharashtrian New Year wishes & creatives.", icon: "Flower", color: "text-green-600" },
  { id: '6', name: "Ambedkar Jayanti", date: "14 Apr", desc: "Tribute posts for Dr. B.R. Ambedkar.", icon: "BookOpen", color: "text-blue-600" },
  { id: '7', name: "Maharashtra Day", date: "01 May", desc: "Celebrate the state foundation day.", icon: "Map", color: "text-orange-600" },
  { id: '8', name: "Father's Day", date: "16 Jun", desc: "Engaging content for Father's Day.", icon: "User", color: "text-blue-500" },
  { id: '9', name: "Independence Day", date: "15 Aug", desc: "Freedom sale posters and wishes.", icon: "Flag", color: "text-orange-500" },
  { id: '10', name: "Raksha Bandhan", date: "19 Aug", desc: "Celebrate the bond of brother & sister.", icon: "Gift", color: "text-red-500" },
  { id: '11', name: "Ganesh Chaturthi", date: "07 Sep", desc: "Welcome Bappa with devotional posts.", icon: "Sparkles", color: "text-orange-600" },
  { id: '12', name: "Diwali", date: "01 Nov", desc: "The biggest festival marketing opportunity.", icon: "Flame", color: "text-yellow-500" },
];

export const NotificationPage: React.FC<NotificationPageProps> = ({ onNavigate }) => {
  // State for tracking subscriptions
  const [subscriptions, setSubscriptions] = useState<Record<string, { email: boolean; push: boolean }>>(() => {
    // Initialize all as enabled for demo purposes
    const initial: any = {};
    UPCOMING_EVENTS.forEach(e => {
        initial[e.id] = { email: true, push: true };
    });
    return initial;
  });

  const toggleSub = (id: string, type: 'email' | 'push') => {
    setSubscriptions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: !prev[id][type]
      }
    }));
  };

  const handleSave = () => {
      alert("Preferences Saved! You will receive reminders 2 days before each event.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">Festival Reminders</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
                Never miss a marketing opportunity! We'll send you a reminder 48 hours before every major Indian festival so you can generate fresh content.
            </p>
        </div>
        <button 
            onClick={handleSave}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
        >
            <Icons.Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      {/* Global Settings Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6E27FF] shadow-sm">
                  <Icons.BellRing className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-slate-800">Smart Alerts Enabled</h3>
                  <p className="text-sm text-slate-600">You will receive notifications via App & Email.</p>
              </div>
          </div>
          <div className="flex gap-3">
             <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1">
                <Icons.Mail className="w-3 h-3" /> amit@example.com
             </span>
             <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1">
                <Icons.Smartphone className="w-3 h-3" /> +91 98765 43210
             </span>
          </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UPCOMING_EVENTS.map((event) => {
            const Icon = Icons[event.icon] as React.ElementType;
            const isEmail = subscriptions[event.id]?.email;
            const isPush = subscriptions[event.id]?.push;

            return (
                <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${event.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 font-mono">
                                {event.date}
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{event.name}</h3>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed h-8 line-clamp-2">
                            {event.desc}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                {/* Email Toggle */}
                                <button 
                                    onClick={() => toggleSub(event.id, 'email')}
                                    className="flex items-center gap-1.5 group/btn"
                                    title="Toggle Email Reminder"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isEmail ? 'bg-[#6E27FF] border-[#6E27FF]' : 'border-slate-300 bg-white'}`}>
                                        {isEmail && <Icons.Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold ${isEmail ? 'text-slate-700' : 'text-slate-400'}`}>Email</span>
                                </button>

                                {/* Push Toggle */}
                                <button 
                                    onClick={() => toggleSub(event.id, 'push')}
                                    className="flex items-center gap-1.5 group/btn"
                                    title="Toggle Push Notification"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isPush ? 'bg-[#6E27FF] border-[#6E27FF]' : 'border-slate-300 bg-white'}`}>
                                        {isPush && <Icons.Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold ${isPush ? 'text-slate-700' : 'text-slate-400'}`}>Push</span>
                                </button>
                            </div>
                            
                            <div className={`w-2 h-2 rounded-full ${isEmail || isPush ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 border-dashed">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Icons.CalendarPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Missing a Festival?</h3>
          <p className="text-sm text-slate-500 mb-4">Request a special day addition and we will add it to the calendar.</p>
          <button className="text-[#6E27FF] font-bold text-sm hover:underline">Request New Event</button>
      </div>

    </div>
  );
};

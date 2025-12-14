
import React, { useState } from 'react';
import { UserPlan, UserProfile, ViewState } from '../types';
import { BUSINESS_TYPES } from '../constants';
import * as Icons from 'lucide-react';

interface ProfilePageProps {
  userProfile: UserProfile;
  userPlan: UserPlan;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpgrade: () => void;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, userPlan, onUpdateProfile, onUpgrade, onLogout, onNavigate }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your profile, business details, and subscription.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal & Business Info Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <Icons.UserCircle className="w-5 h-5 text-slate-400" /> 
                 Profile & Business Details
               </h3>
               {showSuccess && (
                 <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full animate-fade-in flex items-center gap-1">
                   <Icons.Check className="w-3 h-3" /> Saved
                 </span>
               )}
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Personal Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Business Section */}
              <div>
                 <h4 className="font-bold text-slate-700 mb-4">Default Business Settings</h4>
                 <p className="text-xs text-slate-400 mb-4">These details will be pre-filled in the AI generator to save you time.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Type</label>
                      <select 
                        name="businessType" 
                        value={formData.businessType} 
                        onChange={handleChange}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                      >
                        {BUSINESS_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Output Language</label>
                      <select 
                        name="defaultLanguage" 
                        value={formData.defaultLanguage} 
                        onChange={handleChange}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none transition-all"
                      >
                        <option value="Hinglish">Hinglish (Recommended)</option>
                        <option value="Hindi">Hindi</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Plan & Stats */}
        <div className="space-y-6">
          
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</p>
                      <h3 className="text-2xl font-bold font-heading">{userPlan === 'paid' ? 'Growth Plan' : 'Free Plan'}</h3>
                   </div>
                   <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Icons.Crown className="w-6 h-6 text-yellow-300" />
                   </div>
                </div>
             </div>
             
             <div className="p-6">
                <div className="mb-6">
                   <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-600">Daily Generations</span>
                      <span className="text-slate-900">{userPlan === 'paid' ? 'Unlimited' : '2 / 5'}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${userPlan === 'paid' ? 'bg-green-500 w-full' : 'bg-[#6E27FF] w-[40%]'}`}
                      ></div>
                   </div>
                   {userPlan === 'free' && (
                     <p className="text-xs text-slate-400 mt-2">Resets in 14 hours</p>
                   )}
                </div>

                <button 
                  onClick={() => onNavigate('subscription')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${userPlan === 'free' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                   {userPlan === 'free' ? (
                     <>
                       <Icons.Sparkles className="w-4 h-4 text-yellow-400" /> Upgrade to Growth
                     </>
                   ) : (
                     'Manage Subscription'
                   )}
                </button>
             </div>
          </div>

          {/* Support / Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
             <button 
                onClick={() => onNavigate('support')}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-slate-600 text-sm font-medium transition-colors"
             >
                <Icons.HelpCircle className="w-4 h-4" /> Help & Support
             </button>
             <button 
                onClick={() => onNavigate('terms')}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-slate-600 text-sm font-medium transition-colors"
             >
                <Icons.FileText className="w-4 h-4" /> Terms & Privacy
             </button>
             <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm font-medium transition-colors"
             >
                <Icons.LogOut className="w-4 h-4" /> Sign Out
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

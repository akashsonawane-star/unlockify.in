
import React from 'react';
import { UserPlan, ViewState } from '../types';
import * as Icons from 'lucide-react';

interface SubscriptionPageProps {
  userPlan: UserPlan;
  onUpgrade: () => void;
  onNavigate: (view: ViewState) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userPlan, onUpgrade, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <button 
        onClick={() => onNavigate('profile')} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <Icons.ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">Subscription & Billing</h1>
        <p className="text-slate-500 mt-2">Manage your plan, payment methods, and download invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Plan Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Current Plan</h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${userPlan === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {userPlan === 'paid' ? 'Active' : 'Free Tier'}
                 </span>
              </div>
              <div className="p-8">
                 <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">
                            {userPlan === 'paid' ? 'Growth Plan' : 'Free Starter'}
                        </h2>
                        <p className="text-slate-500">
                            {userPlan === 'paid' 
                              ? 'Unlimited access to all AI tools and premium features.' 
                              : 'Limited to 5 generations per day.'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{userPlan === 'paid' ? '₹499' : '₹0'}</div>
                        <div className="text-xs text-slate-400">per month</div>
                    </div>
                 </div>

                 {userPlan === 'free' ? (
                     <div className="bg-gradient-to-r from-[#6E27FF]/5 to-[#3F8CFF]/5 p-6 rounded-xl border border-dashed border-[#6E27FF]/20 mb-6">
                        <h4 className="font-bold text-[#6E27FF] mb-3">Upgrade to unlock:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-slate-700"><Icons.CheckCircle2 className="w-4 h-4 text-green-500"/> Unlimited AI Content</div>
                            <div className="flex items-center gap-2 text-sm text-slate-700"><Icons.CheckCircle2 className="w-4 h-4 text-green-500"/> 30-Day Calendar</div>
                            <div className="flex items-center gap-2 text-sm text-slate-700"><Icons.CheckCircle2 className="w-4 h-4 text-green-500"/> Google Business Tools</div>
                            <div className="flex items-center gap-2 text-sm text-slate-700"><Icons.CheckCircle2 className="w-4 h-4 text-green-500"/> Priority Support</div>
                        </div>
                        <button 
                            onClick={onUpgrade}
                            className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            Upgrade Now <Icons.Zap className="w-4 h-4 text-yellow-400" />
                        </button>
                     </div>
                 ) : (
                     <div className="flex gap-4">
                        <button className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel Subscription
                        </button>
                        <button className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Update Payment Method
                        </button>
                     </div>
                 )}
              </div>
           </div>

           {/* Billing History (Mock) */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800">Billing History</h3>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                               <th className="px-6 py-4">Date</th>
                               <th className="px-6 py-4">Amount</th>
                               <th className="px-6 py-4">Status</th>
                               <th className="px-6 py-4 text-right">Invoice</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {userPlan === 'paid' ? (
                               <>
                                   <tr>
                                       <td className="px-6 py-4 text-slate-900">Oct 24, 2023</td>
                                       <td className="px-6 py-4 text-slate-600">₹499.00</td>
                                       <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Paid</span></td>
                                       <td className="px-6 py-4 text-right"><button className="text-[#6E27FF] hover:underline flex items-center gap-1 justify-end w-full"><Icons.Download className="w-3 h-3"/> PDF</button></td>
                                   </tr>
                                   <tr>
                                       <td className="px-6 py-4 text-slate-900">Sep 24, 2023</td>
                                       <td className="px-6 py-4 text-slate-600">₹499.00</td>
                                       <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Paid</span></td>
                                       <td className="px-6 py-4 text-right"><button className="text-[#6E27FF] hover:underline flex items-center gap-1 justify-end w-full"><Icons.Download className="w-3 h-3"/> PDF</button></td>
                                   </tr>
                               </>
                           ) : (
                               <tr>
                                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No billing history available for free plan.</td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Need Custom Plan?</h3>
                <p className="text-slate-400 text-sm mb-6 relative z-10">For agencies managing 5+ accounts or white-label needs.</p>
                <button className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors relative z-10">
                    Contact Sales
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.ShieldCheck className="w-4 h-4 text-green-500"/> Secure Payment</h4>
                <p className="text-xs text-slate-500 mb-4">
                    Payments are processed securely via Razorpay. We do not store your card details.
                </p>
                <div className="flex gap-2 opacity-60 grayscale">
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

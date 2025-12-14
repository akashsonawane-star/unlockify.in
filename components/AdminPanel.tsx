
import React, { useState } from 'react';
import { UserPlan, UserProfile } from '../types';
import * as Icons from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminPanelProps {
  onLogout: () => void;
  currentUserProfile: UserProfile;
  currentUserPlan: UserPlan;
  onUpdateUserPlan: (plan: UserPlan) => void;
}

type AdminView = 'dashboard' | 'users' | 'revenue' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onLogout, 
  currentUserProfile, 
  currentUserPlan, 
  onUpdateUserPlan 
}) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  // Mock Data for other users
  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Verma', email: 'rahul@gym.com', plan: 'free', joinDate: '2023-10-01', status: 'Active' },
    { id: 2, name: 'Sneha Kapoor', email: 'sneha@boutique.com', plan: 'paid', joinDate: '2023-09-15', status: 'Active' },
    { id: 3, name: 'Vikram Singh', email: 'vikram@cafe.com', plan: 'paid', joinDate: '2023-09-20', status: 'Inactive' },
    { id: 4, name: 'Priya Das', email: 'priya@salon.com', plan: 'free', joinDate: '2023-10-05', status: 'Active' },
  ]);

  const toggleMockUserPlan = (id: number) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, plan: u.plan === 'free' ? 'paid' : 'free' } : u
    ));
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Icons.IndianRupee className="w-5 h-5" /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900">₹1,45,900</div>
           <div className="text-xs text-green-600 font-bold mt-2 flex items-center">
              <Icons.TrendingUp className="w-3 h-3 mr-1" /> +12% from last month
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Users</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Icons.Users className="w-5 h-5" /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900">2,340</div>
           <div className="text-xs text-blue-600 font-bold mt-2 flex items-center">
              <Icons.UserPlus className="w-3 h-3 mr-1" /> +140 new this week
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Paid Subscribers</h3>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Icons.Crown className="w-5 h-5" /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900">856</div>
           <div className="text-xs text-slate-400 font-medium mt-2">
              Conversion Rate: 36.5%
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Generations</h3>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Icons.Zap className="w-5 h-5" /></div>
           </div>
           <div className="text-3xl font-bold text-slate-900">45k+</div>
           <div className="text-xs text-orange-600 font-bold mt-2">
              All time content generated
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Revenue Overview (2023)</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-l border-slate-200 pb-2">
               {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 100].map((h, i) => (
                  <div key={i} className="w-full bg-slate-100 hover:bg-purple-100 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(h * 1500).toLocaleString()}
                     </div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400 px-4">
               <span>Jan</span><span>Dec</span>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Plan Distribution</h3>
            <div className="flex items-center justify-center py-8">
               <div className="w-40 h-40 rounded-full border-[16px] border-slate-100 border-t-[#6E27FF] border-r-[#3F8CFF] rotate-45"></div>
            </div>
            <div className="space-y-3 mt-4">
               <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6E27FF]"></div> Paid Plan</span>
                  <span className="font-bold">36%</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Free Plan</span>
                  <span className="font-bold">64%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
       <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">User Management</h3>
          <div className="flex gap-2">
             <div className="relative">
                <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#6E27FF]" />
             </div>
             <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                <Icons.Download className="w-4 h-4" /> Export CSV
             </button>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                   <th className="px-6 py-4">User</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Current Plan</th>
                   <th className="px-6 py-4">Join Date</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {/* 1. The Actual Current Local User */}
                <tr className="bg-blue-50/50">
                   <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{currentUserProfile.name} (You)</div>
                      <div className="text-xs text-slate-500">{currentUserProfile.email}</div>
                   </td>
                   <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Online</span></td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${currentUserPlan === 'paid' ? 'bg-[#6E27FF]/10 text-[#6E27FF]' : 'bg-slate-200 text-slate-600'}`}>
                         {currentUserPlan}
                      </span>
                   </td>
                   <td className="px-6 py-4 text-slate-600">Just Now</td>
                   <td className="px-6 py-4 text-right">
                      <button 
                         onClick={() => onUpdateUserPlan(currentUserPlan === 'free' ? 'paid' : 'free')}
                         className="text-xs font-bold bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                         {currentUserPlan === 'free' ? 'Upgrade to Paid' : 'Downgrade to Free'}
                      </button>
                   </td>
                </tr>

                {/* 2. Mock Users */}
                {users.map(user => (
                   <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="font-bold text-slate-900">{user.name}</div>
                         <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.plan === 'paid' ? 'bg-[#6E27FF]/10 text-[#6E27FF]' : 'bg-slate-200 text-slate-600'}`}>
                            {user.plan}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.joinDate}</td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => toggleMockUserPlan(user.id)}
                            className="text-slate-400 hover:text-[#6E27FF] font-medium text-xs mr-4"
                          >
                             Manage Plan
                          </button>
                          <button className="text-slate-400 hover:text-red-500">
                             <Icons.Trash2 className="w-4 h-4" />
                          </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
         <div className="p-6 border-b border-slate-800">
            <BrandLogo theme="dark" subtitle="Admin Panel" />
         </div>

         <nav className="flex-1 p-4 space-y-1">
            <button 
               onClick={() => setActiveView('dashboard')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-[#6E27FF] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
               <Icons.LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button 
               onClick={() => setActiveView('users')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'users' ? 'bg-[#6E27FF] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
               <Icons.Users className="w-5 h-5" /> Users & Subs
            </button>
            <button 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white`}
            >
               <Icons.BarChart3 className="w-5 h-5" /> Analytics
            </button>
            <button 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white`}
            >
               <Icons.Settings className="w-5 h-5" /> Settings
            </button>
         </nav>

         <div className="p-4 border-t border-slate-800">
            <button 
               onClick={onLogout}
               className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-bold"
            >
               <Icons.LogOut className="w-4 h-4" /> Logout Admin
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
         {/* Top Header */}
         <header className="bg-white h-16 border-b border-slate-200 px-8 flex items-center justify-between">
             <h2 className="text-xl font-bold text-slate-800 capitalize">{activeView} Overview</h2>
             <div className="flex items-center gap-4">
                 <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                    <Icons.Bell className="w-5 h-5" />
                 </button>
                 <div className="w-8 h-8 bg-[#6E27FF] rounded-full flex items-center justify-center text-white text-xs font-bold">AD</div>
             </div>
         </header>

         <div className="flex-1 overflow-y-auto p-8">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'users' && renderUsers()}
         </div>
      </main>

    </div>
  );
};

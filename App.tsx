
import React, { useState, useEffect } from 'react';
import { ViewState, UserPlan, FormData, AIResponseData, HistoryItem, FeatureType, UserProfile } from './types';
import { generateContent } from './services/geminiService';
import { dbService } from './services/dbService';
import { supabase } from './services/supabaseClient';
import { FEATURES } from './constants';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ContentForm } from './components/ContentForm';
import { ResultDisplay } from './components/ResultDisplay';
import { DashboardHome } from './components/DashboardHome';
import { LandingPage } from './components/LandingPage';
import { ProfilePage } from './components/ProfilePage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { SupportPage } from './components/SupportPage';
import { LegalPage } from './components/LegalPage';
import { AdminPanel } from './components/AdminPanel';
import { SEOManager } from './components/SEOManager';
import { NotificationPage } from './components/NotificationPage';
import * as Icons from 'lucide-react';
import { Loader2, Filter, Edit, RefreshCw, Trash2 } from 'lucide-react';

export const App = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'Salon',
    city: '',
    defaultLanguage: 'Hinglish'
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponseData | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [editingFormData, setEditingFormData] = useState<FormData | null>(null);
  const [savedFilter, setSavedFilter] = useState<FeatureType | 'all'>('all');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (e: any) {
        console.error("Auth init error:", e.message || e);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
          setAuthLoading(false);
          setAuthError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadUserData(session.user.id, session.user.email);
    }
  }, [session]);

  const loadUserData = async (userId: string, email?: string) => {
     try {
         if(email === 'admin@unlockify.in') {
             setIsAdmin(true);
             setCurrentView('admin');
         }

         // Load Profile
         try {
            const profile = await dbService.getUserProfile(userId);
            if (profile) {
                setUserProfile(profile);
                setUserPlan((profile as any).plan || 'free');
            } else {
                const initialProfile: UserProfile = {
                    name: email?.split('@')[0] || 'User',
                    email: email || '',
                    phone: '',
                    businessName: '',
                    businessType: 'Salon',
                    city: '',
                    defaultLanguage: 'Hinglish',
                    plan: 'free'
                };
                
                // Real DB save for non-demo users
                if (!userId.startsWith('demo-user-')) {
                    try {
                        await dbService.updateUserProfile(userId, initialProfile);
                        setUserProfile(initialProfile);
                    } catch (profileError: any) {
                        console.warn("Profile init sync error:", profileError.message || profileError);
                        setUserProfile(initialProfile);
                    }
                } else {
                    setUserProfile(initialProfile);
                }
            }
         } catch (profileFetchError: any) {
            console.error("Error fetching profile:", profileFetchError.message || profileFetchError);
         }

         // Load History
         if (!userId.startsWith('demo-user-')) {
            try {
                const historyData = await dbService.getHistory(userId);
                setHistory(historyData);
            } catch (historyError: any) {
                console.error("Error loading history:", historyError.message || historyError);
            }
         }

     } catch (e: any) {
         console.error("Critical error loading user data:", e.message || e);
     }
  };

  const handleSignUp = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { 
              data: { full_name: name },
              emailRedirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return data;
    } catch (error: any) {
        const message = error.message || "Signup failed. Please try again.";
        setAuthError(message);
        throw error;
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            if (error.message.toLowerCase().includes('confirm')) {
                throw new Error("Email not confirmed. Please check your inbox for the verification link.");
            }
            throw error;
        }
        return data;
    } catch (error: any) {
        const message = error.message || "Login failed. Check your credentials.";
        setAuthError(message);
        throw error;
    }
  };

  const handleGuestLogin = async (email: string, name: string) => {
    const mockSession = {
        user: {
            id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
            email: email,
            user_metadata: { full_name: name }
        },
        access_token: 'demo-token'
    };
    setSession(mockSession);
    setUserProfile(prev => ({ 
        ...prev, 
        name, 
        email,
        businessName: 'Demo Business',
        city: 'Mumbai' 
    }));
    setCurrentView('dashboard');
  };

  const handleResendVerification = async (email: string) => {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
              emailRedirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return true;
    } catch (error: any) {
        setAuthError(error.message);
        return false;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setCurrentView('landing');
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setResult(null);
    setEditingFormData(null);
  };

  const handleEditSaved = (item: HistoryItem) => {
    setEditingFormData(item.input);
    setResult(null);
    setCurrentView(item.feature);
  };

  const handleRegenerateSaved = (item: HistoryItem) => {
    setEditingFormData(item.input);
    setCurrentView(item.feature);
    handleGenerate(item.feature, item.input);
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
      if(!session?.user) return;
      if (session.user.id.startsWith('demo-user-')) {
          setUserProfile(newProfile);
          return;
      }
      try {
          await dbService.updateUserProfile(session.user.id, newProfile);
          setUserProfile(newProfile);
      } catch (e: any) {
          console.error("Update profile failed", e.message || e);
          alert("Failed to update profile.");
      }
  };

  const handleGenerate = async (feature: FeatureType, formData: FormData) => {
    if(!session?.user) return;

    if (userPlan === 'free') {
        const today = new Date().toDateString();
        const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === today).length;
        if (todayCount >= 5) {
            setResult({
                success: false,
                error: true,
                type: feature,
                user_plan: 'free',
                data: {},
                code: "LIMIT_REACHED",
                message: "You've reached your free daily limit. Upgrade to Growth Plan for unlimited content."
            });
            return;
        }
    }

    setIsLoading(true);
    setResult(null);
    setLastFormData(formData);
    
    try {
      const response = await generateContent(feature, formData, userPlan);
      setResult(response);
      
      if (response.success && !session.user.id.startsWith('demo-user-')) {
        const newItem: HistoryItem = {
          id: '', 
          timestamp: Date.now(),
          feature: feature,
          input: formData,
          output: response
        };
        
        try {
            const savedItem = await dbService.addToHistory(session.user.id, newItem);
            if(savedItem) {
                 const frontendItem: HistoryItem = {
                     id: savedItem.id,
                     timestamp: new Date(savedItem.created_at).getTime(),
                     feature: savedItem.feature,
                     input: savedItem.input_data,
                     output: savedItem.output_data
                 };
                 setHistory(prev => [frontendItem, ...prev]);
            }
        } catch (dbErr) {
            console.warn("History save error:", dbErr);
        }
      }
    } catch (error: any) {
      console.error(error.message || error);
      setResult({
        success: false,
        type: feature,
        user_plan: userPlan,
        data: {},
        error: true,
        message: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
     if(confirm('Are you sure you want to delete this item?')) {
        try {
            await dbService.deleteHistory(id);
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch(e: any) {
            alert("Failed to delete item.");
        }
     }
  };

  const handleFormSubmit = (formData: FormData) => {
    if (['dashboard', 'saved', 'landing', 'profile', 'subscription', 'support', 'terms', 'admin', 'notifications'].includes(currentView)) return;
    handleGenerate(currentView as FeatureType, formData);
  };

  if (authLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#F7F9FC]">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-[#6E27FF] animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Authenticating...</p>
              </div>
          </div>
      );
  }

  if (!session) {
    return (
      <>
        <SEOManager view="landing" />
        <LandingPage 
          onSignUp={handleSignUp} 
          onSignIn={handleSignIn} 
          onResendVerification={handleResendVerification}
          onGuestLogin={handleGuestLogin}
          authError={authError}
        />
      </>
    );
  }

  if (isAdmin || currentView === 'admin') {
      return (
        <>
          <SEOManager view="admin" />
          <AdminPanel 
              onLogout={handleLogout} 
              currentUserProfile={userProfile}
              currentUserPlan={userPlan}
              onUpdateUserPlan={setUserPlan}
          />
        </>
      );
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardHome 
            onNavigate={handleNavigate} 
            recentHistory={history} 
            userName={userProfile.name}
          />
        );
      
      case 'profile':
        return (
          <ProfilePage 
            userProfile={userProfile} 
            userPlan={userPlan} 
            onUpdateProfile={handleUpdateProfile} 
            onUpgrade={() => handleNavigate('subscription')} 
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        );
      
      case 'subscription':
        return (
          <SubscriptionPage 
            userPlan={userPlan} 
            onUpgrade={() => setUserPlan('paid')} 
            onNavigate={handleNavigate}
          />
        );

      case 'support':
        return <SupportPage onNavigate={handleNavigate} />;
      
      case 'terms':
        return <LegalPage onNavigate={handleNavigate} />;

      case 'notifications':
        return <NotificationPage onNavigate={handleNavigate} />;

      case 'saved':
        const filteredHistory = savedFilter === 'all' 
            ? history 
            : history.filter(h => h.feature === savedFilter);

        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-slate-900">Saved Library</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and repurpose your past content.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                    <button 
                      onClick={() => setSavedFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${savedFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      All
                    </button>
                    {FEATURES.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => setSavedFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${savedFilter === f.id ? 'bg-[#6E27FF] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {f.label.split(' ')[0]}
                      </button>
                    ))}
                </div>
            </div>

            {filteredHistory.length === 0 ? (
               <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                     <Filter className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No saved content found</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-6">Create something amazing to see it here.</p>
                  <button onClick={() => setCurrentView('dashboard')} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm">Create New</button>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHistory.map((item) => {
                      const featureDef = FEATURES.find(f => f.id === item.feature);
                      const getPreview = (data: any) => {
                          if (!data) return "No preview";
                          if (item.feature === 'instagram') return data.caption || data.posts?.[0]?.caption || "Caption...";
                          if (item.feature === 'whatsapp') return data.variants?.[0] || data.messages?.[0]?.text || "Message...";
                          if (item.feature === 'reels') return data.script || data.scripts?.[0]?.script || "Script...";
                          if (item.feature === 'festival') return data.caption || "Festival wish...";
                          return "Click to view content";
                      };

                      return (
                          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative">
                               <button 
                                  onClick={() => handleDeleteHistory(item.id)}
                                  className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                                  title="Delete"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                               
                               <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                           <span className="font-bold text-xs">{item.feature.slice(0,2).toUpperCase()}</span>
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-slate-800 text-sm">{featureDef?.label || item.feature}</h4>
                                           <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                                       </div>
                                   </div>
                                   <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono text-slate-500">
                                       {item.input.language}
                                   </div>
                               </div>

                               <div className="flex-1 bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 overflow-hidden relative">
                                   <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-medium">
                                       {getPreview(item.output.data)}
                                   </p>
                                   <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                               </div>

                               <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                   <button 
                                     onClick={() => handleEditSaved(item)}
                                     className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                   >
                                      <Edit className="w-3.5 h-3.5" /> Edit
                                   </button>
                                   <div className="w-px h-4 bg-slate-200"></div>
                                   <button 
                                     onClick={() => handleRegenerateSaved(item)}
                                     className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#6E27FF] hover:bg-purple-50 rounded-lg transition-colors"
                                   >
                                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                   </button>
                               </div>
                          </div>
                      );
                  })}
               </div>
            )}
          </div>
        );
      
      default:
        const featureDef = FEATURES.find(f => f.id === currentView);
        if (!featureDef) return <div>Feature not found</div>;

        return (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:hidden col-span-1 mb-2">
               <h2 className="text-xl font-bold text-slate-900">{featureDef.label}</h2>
            </div>
            <div className="lg:col-span-5 space-y-6">
               <div className="hidden lg:block mb-2">
                   <h2 className="text-2xl font-heading font-bold text-slate-900">{featureDef.label}</h2>
                   <p className="text-slate-500 text-sm mt-1">{featureDef.description}</p>
               </div>
               
               <ContentForm 
                 feature={currentView as FeatureType} 
                 userPlan={userPlan}
                 isLoading={isLoading}
                 onSubmit={handleFormSubmit}
                 initialData={editingFormData || {
                    businessName: userProfile.businessName,
                    businessType: userProfile.businessType,
                    city: userProfile.city,
                    language: userProfile.defaultLanguage,
                    tone: 'Friendly',
                    offerDetails: '',
                 }}
               />
            </div>
            <div className="lg:col-span-7">
               {result ? (
                  <ResultDisplay 
                    result={result} 
                    feature={currentView as FeatureType} 
                    onRegenerate={() => handleGenerate(currentView as FeatureType, lastFormData!)}
                    isRegenerating={isLoading}
                    formData={lastFormData}
                  />
               ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                     {isLoading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-32"></div>
                        </div>
                     ) : (
                        <>
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                {React.createElement((Icons as any)[featureDef.icon] || Loader2, { className: "w-8 h-8" })}
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Ready to Create?</h3>
                            <p className="text-slate-400 max-w-xs mt-2 text-sm">Fill out the details on the left and let AI generate professional content for you.</p>
                        </>
                     )}
                  </div>
               )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden font-sans">
      <SEOManager view={currentView} />
      {!isAdmin && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleNavigate} 
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          userProfile={userProfile}
        />
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!isAdmin && (
          <TopBar 
            userPlan={userPlan} 
            onPlanChange={setUserPlan} 
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

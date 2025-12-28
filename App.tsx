
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, UserPlan, FormData, AIResponseData, HistoryItem, FeatureType, UserProfile } from './types';
import { generateContent } from './services/geminiService';
import { dbService } from './services/dbService';
import { supabase, checkSupabaseConnection } from './services/supabaseClient';
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
import { Loader2, AlertTriangle, WifiOff, RefreshCw, Trash2 } from 'lucide-react';

export const App = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

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

  const profileCompleteness = useMemo(() => {
    const fields = ['name', 'phone', 'businessName', 'city'];
    const filledFields = fields.filter(field => !!(userProfile as any)[field]);
    const percentage = (filledFields.length / fields.length) * 100;
    return {
      isComplete: percentage === 100,
      percentage,
      missingFields: fields.filter(field => !(userProfile as any)[field])
    };
  }, [userProfile]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if the network is alive
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setIsOffline(true);
          setAuthLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (e: any) {
        const msg = e.message?.toLowerCase() || "";
        if (msg.includes('failed to fetch') || e instanceof TypeError) {
          console.warn("Auth check failed: Network error. Switching to local mode.");
          setIsOffline(true);
        } else {
          console.error("Auth initialization error:", e);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
          setAuthLoading(false);
          setAuthError(null);
          setIsOffline(false);
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
         if(email === 'admin@unlockify.in' || email === 'unlockify.in@gmail.com') {
             setIsAdmin(true);
             setCurrentView('admin');
         }

         const initialProfile: UserProfile = {
            name: session?.user?.user_metadata?.full_name || email?.split('@')[0] || 'User',
            email: email || '',
            phone: '',
            businessName: '',
            businessType: 'Salon',
            city: '',
            defaultLanguage: 'Hinglish',
            plan: 'free'
         };

         try {
            const profile = await dbService.getUserProfile(userId);
            if (profile) {
                setUserProfile(profile);
                setUserPlan((profile as any).plan || 'free');
            } else if (!userId.startsWith('demo-user-')) {
                await dbService.updateUserProfile(userId, initialProfile);
                setUserProfile(initialProfile);
            } else {
                setUserProfile(initialProfile);
            }
         } catch (dbErr: any) {
            if (dbErr.message === 'NETWORK_ERROR') setIsOffline(true);
            setUserProfile(initialProfile);
         }

         if (!userId.startsWith('demo-user-')) {
            try {
                const historyData = await dbService.getHistory(userId);
                setHistory(historyData);
            } catch (historyError: any) {
                if (historyError.message === 'NETWORK_ERROR') setIsOffline(true);
                setHistory([]);
            }
         }

     } catch (e: any) {
         console.error("Critical User Load Error:", e);
     }
  };

  const handleSignUp = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: name }, emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        return data;
    } catch (error: any) {
        const msg = error.message?.toLowerCase() || "";
        setAuthError(msg.includes('failed to fetch') ? "Connection error. Check your ad-blocker or internet." : error.message);
        throw error;
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        return data;
    } catch (error: any) {
        const msg = error.message?.toLowerCase() || "";
        setAuthError(msg.includes('failed to fetch') ? "Connection error. Check your ad-blocker or internet." : error.message);
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
    setUserProfile(prev => ({ ...prev, name, email, businessName: '', city: '' }));
    setCurrentView('dashboard');
    setIsOffline(false);
  };

  const handleResendVerification = async (email: string) => {
    try {
        const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        return true;
    } catch (error: any) {
        const msg = error.message?.toLowerCase() || "";
        setAuthError(msg.includes('failed to fetch') ? "Connection error." : error.message);
        return false;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setSession(null);
    setIsAdmin(false);
    setCurrentView('landing');
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setResult(null);
    setEditingFormData(null);
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
          setIsOffline(false);
      } catch (e: any) {
          if (e.message === 'NETWORK_ERROR') setIsOffline(true);
          console.error("Profile Save Error:", e.message);
      }
  };

  const handleGenerate = async (feature: FeatureType, formData: FormData) => {
    if(!session?.user) return;

    if (userPlan === 'free') {
        const today = new Date().toDateString();
        const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === today).length;
        if (todayCount >= 5) {
            setResult({ success: false, error: true, type: feature, user_plan: 'free', data: {}, code: "LIMIT_REACHED", message: "Daily limit reached." });
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
        const newItem: HistoryItem = { id: '', timestamp: Date.now(), feature: feature, input: formData, output: response };
        try {
            const savedItem = await dbService.addToHistory(session.user.id, newItem);
            if(savedItem) {
                 const frontendItem: HistoryItem = { id: savedItem.id, timestamp: new Date(savedItem.created_at).getTime(), feature: savedItem.feature, input: savedItem.input_data, output: savedItem.output_data };
                 setHistory(prev => [frontendItem, ...prev]);
            }
        } catch (dbErr: any) {
            if (dbErr.message === 'NETWORK_ERROR') setIsOffline(true);
        }
      }
    } catch (error: any) {
      setResult({ success: false, type: feature, user_plan: userPlan, data: {}, error: true, message: "AI generation failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
     if(confirm('Delete this saved content?')) {
        try {
            await dbService.deleteHistory(id);
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch(e: any) {
            if (e.message === 'NETWORK_ERROR') setIsOffline(true);
            alert("Delete failed.");
        }
     }
  };

  const handleEditSaved = (item: HistoryItem) => {
    setEditingFormData(item.input);
    setCurrentView(item.feature);
    setResult(null);
  };

  const handleRegenerateSaved = (item: HistoryItem) => {
    setEditingFormData(item.input);
    setCurrentView(item.feature);
    setResult(null);
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
                <p className="text-slate-500 font-medium">Booting Unlockify...</p>
              </div>
          </div>
      );
  }

  if (!session && !isOffline) {
    return (
      <>
        <SEOManager view="landing" />
        <LandingPage onSignUp={handleSignUp} onSignIn={handleSignIn} onResendVerification={handleResendVerification} onGuestLogin={handleGuestLogin} authError={authError} />
      </>
    );
  }

  if (isOffline && !session) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7F9FC] p-6 text-slate-900">
          <div className="max-w-md text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <WifiOff className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold">Connection Interrupted</h1>
              <p className="text-slate-500 text-sm">We're having trouble reaching our servers. This is often caused by <strong>ad-blockers</strong>, a <strong>VPN</strong>, or a firewall. Please try disabling them.</p>
              <div className="flex flex-col gap-3">
                  <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Retry Connection
                  </button>
                  <button onClick={() => handleGuestLogin('offline@unlockify.in', 'Offline User')} className="text-sm text-slate-500 hover:text-slate-800 underline">Continue to Demo (Guest Mode)</button>
              </div>
          </div>
      </div>
    );
  }

  if (isAdmin || currentView === 'admin') {
      return (
        <>
          <SEOManager view="admin" />
          <AdminPanel onLogout={handleLogout} currentUserProfile={userProfile} currentUserPlan={userPlan} onUpdateUserPlan={setUserPlan} />
        </>
      );
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard': return (
        <DashboardHome 
          onNavigate={handleNavigate} 
          recentHistory={history} 
          userName={userProfile.name} 
          completeness={profileCompleteness}
        />
      );
      case 'profile': return <ProfilePage userProfile={userProfile} userPlan={userPlan} onUpdateProfile={handleUpdateProfile} onUpgrade={() => handleNavigate('subscription')} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'subscription': return <SubscriptionPage userPlan={userPlan} onUpgrade={() => setUserPlan('paid')} onNavigate={handleNavigate} />;
      case 'support': return <SupportPage onNavigate={handleNavigate} />;
      case 'terms': return <LegalPage onNavigate={handleNavigate} />;
      case 'notifications': return <NotificationPage onNavigate={handleNavigate} />;
      case 'saved':
        const filteredHistory = savedFilter === 'all' ? history : history.filter(h => h.feature === savedFilter);
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-slate-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold font-heading">Saved Library</h2>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                    <button onClick={() => setSavedFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${savedFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>All</button>
                    {FEATURES.map(f => (
                      <button key={f.id} onClick={() => setSavedFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${savedFilter === f.id ? 'bg-[#6E27FF] text-white' : 'text-slate-500'}`}>{f.label.split(' ')[0]}</button>
                    ))}
                </div>
            </div>
            {filteredHistory.length === 0 ? (
               <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300"><p className="text-slate-500 text-sm">Library is empty.</p></div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHistory.map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
                          <button onClick={() => handleDeleteHistory(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash2 className="w-4 h-4" /></button>
                          <div className="font-bold text-slate-800 text-sm mb-1">{FEATURES.find(f => f.id === item.feature)?.label}</div>
                          <div className="text-[10px] text-slate-400 mb-3">{new Date(item.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-600 line-clamp-3 mb-4">{JSON.stringify(item.output.data)}</div>
                          <div className="flex gap-4">
                              <button onClick={() => handleEditSaved(item)} className="text-[11px] font-bold text-[#6E27FF] hover:underline">Edit</button>
                              <button onClick={() => handleRegenerateSaved(item)} className="text-[11px] font-bold text-slate-500 hover:underline">Remix</button>
                          </div>
                      </div>
                  ))}
               </div>
            )}
          </div>
        );
      default:
        const featureDef = FEATURES.find(f => f.id === currentView);
        if (!featureDef) return <div>Feature not found</div>;
        return (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
               <ContentForm feature={currentView as FeatureType} userPlan={userPlan} isLoading={isLoading} onSubmit={handleFormSubmit} initialData={editingFormData || { businessName: userProfile.businessName, businessType: userProfile.businessType, city: userProfile.city, language: userProfile.defaultLanguage, tone: 'Friendly', offerDetails: '', }} />
            </div>
            <div className="lg:col-span-7">
               {result ? <ResultDisplay result={result} feature={currentView as FeatureType} onRegenerate={() => handleGenerate(currentView as FeatureType, lastFormData!)} isRegenerating={isLoading} formData={lastFormData} /> : <div className="h-full min-h-[400px] flex items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center p-8"><p className="text-slate-400">Your AI-generated content will appear here.</p></div>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden font-sans">
      <SEOManager view={currentView} />
      {!isAdmin && <Sidebar currentView={currentView} onViewChange={handleNavigate} isOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} userProfile={userProfile} />}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isOffline && (
           <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-[11px] font-bold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              Database connection unstable. Guest mode activated.
              <button onClick={() => window.location.reload()} className="underline ml-2">Retry Sync</button>
           </div>
        )}
        {!isAdmin && <TopBar userPlan={userPlan} onPlanChange={setUserPlan} onMenuClick={() => setIsSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">{renderMainContent()}</main>
      </div>
    </div>
  );
};

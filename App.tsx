
import React, { useState, useEffect } from 'react';
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
import { SEOManager } from './components/SEOManager';
import { NotificationPage } from './components/NotificationPage';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';

export const App = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', email: '', phone: '', businessName: '', businessType: 'Salon', city: '', defaultLanguage: 'Hinglish'
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponseData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global error handler for network failures
  useEffect(() => {
    const handleError = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message?.toLowerCase() || "";
      if (msg.includes("failed to fetch") || msg.includes("load failed")) {
        setIsOffline(true);
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
        setIsOffline(true);
      } finally {
        setAuthLoading(false);
      }
    };
    initializeAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setIsOffline(false);
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
         // Don't try to fetch from DB if it's a demo user
         if (userId.startsWith('demo-')) {
            setUserProfile(prev => ({ ...prev, email: email || '', name: prev.name || 'Demo User' }));
            return;
         }

         const profile = await dbService.getUserProfile(userId);
         if (profile) {
             setUserProfile(profile);
             setUserPlan(profile.plan || 'free');
         }
         const historyData = await dbService.getHistory(userId);
         setHistory(historyData);
     } catch (e: any) {
         if (e.message === 'NETWORK_ERROR') setIsOffline(true);
     }
  };

  const handleSignUp = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name }
      }
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  };

  const handleSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  };

  const handleResendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    return !error;
  };

  const handleGuestLogin = async (email: string, name: string) => {
    setSession({ user: { id: 'demo-' + Date.now(), email } });
    setUserProfile(prev => ({ ...prev, name, email }));
    setCurrentView('dashboard');
    setIsOffline(false);
    setAuthError(null);
  };

  const handleFeatureSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setResult(null);
    setCurrentFormData(formData);
    
    try {
      const featureType = currentView as FeatureType;
      const response = await generateContent(featureType, formData, userPlan);
      setResult(response);
      
      if (response.success && session?.user?.id && !session.user.id.startsWith('demo-')) {
        const historyItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          feature: featureType,
          input: formData,
          output: response
        };
        await dbService.addToHistory(session.user.id, historyItem);
        setHistory(prev => [historyItem, ...prev]);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setResult({
        success: false,
        error: true,
        type: currentView,
        user_plan: userPlan,
        data: {},
        message: "Something went wrong while generating content. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (session?.user?.id?.startsWith('demo-')) {
      setSession(null);
    } else {
      await supabase.auth.signOut();
    }
    setResult(null);
    setHistory([]);
    setCurrentView('dashboard');
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-[#6E27FF]" /></div>;

  if (!session && !isOffline) return (
    <LandingPage 
      onSignUp={handleSignUp} 
      onSignIn={handleSignIn} 
      onResendVerification={handleResendVerification} 
      onGuestLogin={handleGuestLogin} 
      authError={authError} 
    />
  );

  if (isOffline && !session) return (
    <div className="h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
      <div className="max-w-md">
        <WifiOff className="w-16 h-16 mx-auto mb-6 text-amber-500" />
        <h1 className="text-2xl font-bold mb-4">Connection Blocked</h1>
        <p className="text-slate-500 mb-8 text-sm">Our services seem unreachable. Please disable your <strong>ad-blocker</strong> or VPN and try again.</p>
        <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Try Sync</button>
        <button onClick={() => handleGuestLogin('guest@unlockify.in', 'Guest')} className="mt-4 text-xs underline text-slate-400">Continue Offline (Guest Mode)</button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome recentHistory={history} onNavigate={setCurrentView} userName={userProfile.name} />;
      case 'profile':
        return <ProfilePage userProfile={userProfile} userPlan={userPlan} onUpdateProfile={setUserProfile} onUpgrade={() => setCurrentView('subscription')} onLogout={handleLogout} onNavigate={setCurrentView} />;
      case 'subscription':
        return <SubscriptionPage userPlan={userPlan} onUpgrade={() => setUserPlan('paid')} onNavigate={setCurrentView} />;
      case 'support':
        return <SupportPage onNavigate={setCurrentView} />;
      case 'terms':
        return <LegalPage onNavigate={setCurrentView} />;
      case 'notifications':
        return <NotificationPage onNavigate={setCurrentView} />;
      default:
        // Handle Feature Views
        if (FEATURES.some(f => f.id === currentView)) {
          return (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
              <ContentForm 
                feature={currentView as FeatureType} 
                userPlan={userPlan} 
                isLoading={isLoading} 
                onSubmit={handleFeatureSubmit}
                initialData={currentFormData}
              />
              {result && (
                <ResultDisplay 
                  result={result} 
                  feature={currentView as FeatureType} 
                  onRegenerate={() => handleFeatureSubmit(currentFormData!)}
                  isRegenerating={isLoading}
                  formData={currentFormData}
                />
              )}
            </div>
          );
        }
        return <DashboardHome recentHistory={history} onNavigate={setCurrentView} userName={userProfile.name} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden font-sans">
      <SEOManager view={currentView} />
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setResult(null); // Clear result when switching views
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen} 
        onCloseMobile={() => setIsSidebarOpen(false)} 
        userProfile={userProfile} 
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isOffline && <div className="bg-amber-500 text-white text-[10px] font-bold py-1 text-center tracking-widest">OFFLINE MODE ACTIVATED</div>}
        <TopBar userPlan={userPlan} onPlanChange={setUserPlan} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

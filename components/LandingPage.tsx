
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { ComingSoonSection } from './ComingSoonSection';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  onSignUp: (email: string, pass: string, name: string) => Promise<any>;
  onSignIn: (email: string, pass: string) => Promise<any>;
  onResendVerification: (email: string) => Promise<boolean>;
  onGuestLogin: (email: string, name: string) => Promise<void>;
  authError: string | null;
}

const AuthModal: React.FC<{ 
  onClose: () => void; 
  onSignUp: (email: string, pass: string, name: string) => Promise<any>;
  onSignIn: (email: string, pass: string) => Promise<any>;
  onResendVerification: (email: string) => Promise<boolean>;
  onGuestLogin: (email: string, name: string) => Promise<void>;
  authError: string | null;
}> = ({ onClose, onSignUp, onSignIn, onResendVerification, onGuestLogin, authError }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResendStatus(null);
    try {
        if (mode === 'signup') {
            const data = await onSignUp(email, password, name);
            if (data?.user) {
                // If user is created but session is null, email confirmation might be required
                setIsSuccess(true);
            }
        } else {
            await onSignIn(email, password);
            onClose();
        }
    } catch (err) {
        // Parent handle errors via props
    } finally {
        setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
        alert("Enter your email first.");
        return;
    }
    setResendLoading(true);
    const success = await onResendVerification(email);
    if (success) {
        setResendStatus("Email Sent!");
        setTimeout(() => setResendStatus(null), 5000);
    }
    setResendLoading(false);
  };

  const errorMessage = authError || null;

  if (isSuccess) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md text-slate-900 animate-fade-in">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative text-center border border-slate-100">
              <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"><Icons.X /></button>
              
              <div className="w-20 h-20 bg-purple-50 text-[#6E27FF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.MailCheck className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 font-heading">Check Your Email</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  We've sent a magic link to <span className="text-slate-900 font-bold">{email}</span>.<br/> 
                  Click it to activate your business profile.
              </p>
              
              <div className="space-y-4">
                 <button 
                    onClick={handleResend} 
                    disabled={resendLoading} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                 >
                    {resendLoading ? <Icons.Loader2 className="animate-spin w-5 h-5" /> : <Icons.RefreshCw className="w-4 h-4" />}
                    {resendStatus || "Resend Verification Link"}
                 </button>
                 
                 <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <p className="text-[11px] text-slate-400 font-medium">Mail not arriving? Check Spam or try below:</p>
                    <button 
                        onClick={() => onGuestLogin(email, name || 'Business Owner')} 
                        className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Icons.Zap className="w-3 h-3 text-orange-500" /> Enter Dashboard (Skip Verification)
                    </button>
                    <button onClick={() => { setIsSuccess(false); setMode('signin'); }} className="text-xs text-slate-400 hover:text-slate-600 font-bold underline">Back to Log In</button>
                 </div>
              </div>
           </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in text-slate-900">
       <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative border border-slate-100">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
            <Icons.X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
             <div className="flex justify-center mb-6">
                <BrandLogo withText={false} className="w-14 h-14" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 font-heading">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
             </h2>
             <p className="text-slate-500 text-sm mt-2">Unlock AI Marketing for your brand.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
             <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Sign Up</button>
             <button onClick={() => setMode('signin')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'signin' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Log In</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {mode === 'signup' && (
                <div className="relative">
                    <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6E27FF] transition-all bg-slate-50" placeholder="Business Owner Name" />
                </div>
             )}
             <div className="relative">
                <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6E27FF] transition-all bg-slate-50" placeholder="Email Address" />
             </div>
             <div className="relative">
                <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6E27FF] transition-all bg-slate-50" placeholder="Create Password" />
             </div>

             {errorMessage && (
               <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-xl flex items-start gap-2 animate-shake">
                  <Icons.AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-bold leading-relaxed">{errorMessage}</span>
               </div>
             )}

             <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center shadow-lg transform active:scale-95 transition-all disabled:opacity-70">
                {loading ? <Icons.Loader2 className="animate-spin w-5 h-5" /> : (mode === 'signup' ? 'Join Now Free' : 'Sign In')}
             </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-slate-50">
              <button onClick={() => onGuestLogin('demo@unlockify.in', 'Guest User')} className="text-[11px] text-slate-400 hover:text-[#6E27FF] font-medium underline transition-colors">
                  Check out the Demo Preview
              </button>
          </div>
       </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn, onResendVerification, onGuestLogin, authError }) => {
  const [showAuth, setShowAuth] = useState(false);
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 font-sans">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSignUp={onSignUp} onSignIn={onSignIn} onResendVerification={onResendVerification} onGuestLogin={onGuestLogin} authError={authError} />}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <BrandLogo />
            <div className="flex items-center gap-4">
            <button onClick={() => setShowAuth(true)} className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</button>
            <button onClick={() => setShowAuth(true)} className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">Start Free</button>
            </div>
        </div>
      </nav>
      
      <section className="pt-40 pb-32 px-6 text-center max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] -z-10"></div>
        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight tracking-tight">AI Marketing for <span className="gradient-text">Your Business</span></h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">Stop wasting hours on social media. Let AI handle your Instagram, WhatsApp, and Reels marketing effortlessly.</p>
        <button onClick={() => setShowAuth(true)} className="px-10 py-4 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all">Get Started — It's Free</button>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 mb-20">
         <ComingSoonSection />
      </div>
    </div>
  );
};

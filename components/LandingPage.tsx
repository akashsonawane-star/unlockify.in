
import React, { useState } from 'react';
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
            // In Supabase, if confirmation is required, session is null.
            if (data?.user) {
                setIsSuccess(true);
            }
        } else {
            await onSignIn(email, password);
            onClose();
        }
    } catch (err) {
        // Error is passed via props
    } finally {
        setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
        alert("Please enter your email first.");
        return;
    }
    setResendLoading(true);
    const success = await onResendVerification(email);
    if (success) {
        setResendStatus("Link Sent!");
        setTimeout(() => setResendStatus(null), 3000);
    }
    setResendLoading(false);
  };

  const errorMessage = authError ? (typeof authError === 'string' ? authError : "An error occurred.") : null;

  if (isSuccess) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in text-slate-900">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative text-center border border-slate-100">
              <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2"><Icons.X className="w-6 h-6" /></button>
              
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#6E27FF] ring-8 ring-purple-50/50">
                  <Icons.Mail className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3 font-heading">Verify Your Email</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed px-2">
                  We've sent a verification link to <span className="text-slate-900 font-bold">{email}</span>. 
                  Click the link in the email to activate your account.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex items-start gap-4 text-left">
                  <Icons.Info className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="text-[13px] text-slate-600 leading-normal">
                      Check your <b>Spam</b> or <b>Promotions</b> folder if you don't see it in your main inbox within 2 minutes.
                  </p>
              </div>
              
              <div className="space-y-3">
                <button 
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    {resendLoading ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.RefreshCw className="w-5 h-5" />}
                    {resendStatus || "Resend Verification Link"}
                </button>
                
                <button 
                    onClick={() => { setIsSuccess(false); setMode('signin'); }}
                    className="w-full py-3 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                >
                    Back to Login
                </button>
              </div>
           </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in text-slate-900">
       <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative border border-slate-100">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 rounded-full transition-all hover:bg-slate-50">
            <Icons.X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-10">
             <div className="flex justify-center mb-6">
                <BrandLogo withText={false} className="w-16 h-16 scale-110" />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 font-heading">
                {mode === 'signup' ? 'Create Account' : 'Login to Unlockify'}
             </h2>
             <p className="text-slate-500 text-sm mt-3">
                {mode === 'signup' ? 'Join 5,000+ business owners growing with AI.' : 'Continue where you left off.'}
             </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
             <button 
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Sign Up
             </button>
             <button 
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Log In
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
             {mode === 'signup' && (
               <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Full Name</label>
                  <div className="relative">
                    <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#6E27FF] focus:ring-4 focus:ring-purple-50 transition-all text-slate-700 font-medium"
                        placeholder="Rahul Sharma"
                    />
                  </div>
               </div>
             )}
             
             <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Business Email</label>
                <div className="relative">
                    <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#6E27FF] focus:ring-4 focus:ring-purple-50 transition-all text-slate-700 font-medium"
                        placeholder="you@company.com"
                    />
                </div>
             </div>

             <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Password</label>
                <div className="relative">
                    <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#6E27FF] focus:ring-4 focus:ring-purple-50 transition-all text-slate-700 font-medium"
                        placeholder="••••••••"
                    />
                </div>
             </div>

             {errorMessage && (
               <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl flex items-start gap-2 animate-shake">
                  <Icons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-semibold leading-relaxed">{errorMessage}</span>
               </div>
             )}

             <button 
               type="submit" 
               disabled={loading}
               className="w-full py-4.5 bg-slate-900 text-white rounded-[1.25rem] font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 transform active:scale-[0.98]"
             >
                {loading ? <Icons.Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'signup' ? 'Create My Account' : 'Sign In Now')}
             </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
              <button 
                onClick={() => onGuestLogin('demo@unlockify.in', 'Guest User')}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center gap-2"
              >
                  <Icons.ShieldCheck className="w-4 h-4" /> 
                  Just want a quick look? <span className="underline font-bold">Try Demo Preview</span>
              </button>
          </div>

          <p className="text-[10px] text-center text-slate-400 mt-8 leading-relaxed max-w-[280px] mx-auto">
             By joining, you agree to Unlockify's <a href="#" className="underline font-bold">Terms</a> and <a href="#" className="underline font-bold">Privacy Policy</a>.
          </p>
       </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn, onResendVerification, onGuestLogin, authError }) => {
  const [showDemo, setShowDemo] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleStartClick = () => {
    setShowAuth(true);
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 font-sans overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} onStart={() => { setShowDemo(false); handleStartClick(); }} />}
      {showAuth && (
        <AuthModal 
            onClose={() => setShowAuth(false)} 
            onSignUp={onSignUp} 
            onSignIn={onSignIn}
            onResendVerification={onResendVerification}
            onGuestLogin={onGuestLogin}
            authError={authError}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <BrandLogo />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-[#6E27FF] transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-[#6E27FF] transition-colors">How it Works</a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-[#6E27FF] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleStartClick} className="hidden md:block text-slate-600 hover:text-[#6E27FF] font-medium text-sm">
              Sign In
            </button>
            <button 
              onClick={handleStartClick}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hidden md:block"
            >
              Start Free
            </button>
            
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 shadow-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">#1 AI Marketing Tool for India 🇮🇳</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-5xl mx-auto">
            AI Marketing Assistant for <br className="hidden md:block" />
            <span className="gradient-text">Your Local Business</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create Instagram posts, WhatsApp messages, and marketing plans instantly with AI tailored for Indian businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={handleStartClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Sparkles className="w-5 h-5 fill-current" />
              Create Free Account
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Icons.PlayCircle className="w-5 h-5" />
              View Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
               <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                  <BrandLogo theme="dark" withText={true} />
               </div>
               <p className="max-w-xs mx-auto md:mx-0 text-sm">Automating marketing for 10M+ local businesses in India.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <h4 className="font-bold text-white mb-4">Product</h4>
                  <ul className="space-y-2 text-xs">
                     <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                     <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-white mb-4">Legal</h4>
                  <ul className="space-y-2 text-xs">
                     <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  </ul>
               </div>
            </div>
            <div>
               <h4 className="font-bold text-white mb-4">Connect</h4>
               <p className="text-xs mb-4">Made with ❤️ in India 🇮🇳</p>
               <div className="flex justify-center md:justify-start gap-4">
                  <a href="#" className="text-slate-400 hover:text-white"><Icons.Instagram className="w-5 h-5" /></a>
                  <a href="#" className="text-slate-400 hover:text-white"><Icons.Twitter className="w-5 h-5" /></a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

const DemoModal: React.FC<{ onClose: () => void; onStart: () => void }> = ({ onClose, onStart }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "1. Select Tool", desc: "Choose Instagram, WhatsApp or Reels.", icon: Icons.LayoutGrid },
    { title: "2. Enter Details", desc: "Type your business name and offer.", icon: Icons.PenTool },
    { title: "3. AI Magic", desc: "Get professional content in seconds.", icon: Icons.Sparkles }
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><Icons.X className="w-6 h-6" /></button>
        <div className="text-center py-10">
           <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
             {React.createElement(steps[step].icon, { className: "w-8 h-8" })}
           </div>
           <h3 className="text-2xl font-bold mb-2">{steps[step].title}</h3>
           <p className="text-slate-500 mb-8">{steps[step].desc}</p>
           <div className="flex justify-between items-center">
             {step > 0 && <button onClick={() => setStep(step-1)} className="text-slate-400 font-bold">Back</button>}
             <button 
                onClick={() => step < 2 ? setStep(step+1) : onStart()} 
                className="ml-auto bg-slate-900 text-white px-6 py-2 rounded-full font-bold"
             >
               {step < 2 ? 'Next' : 'Create Account'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

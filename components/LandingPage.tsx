
import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ComingSoonSection } from './ComingSoonSection';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  onStart: (email?: string) => void;
}

// Demo Modal Component
const DemoModal: React.FC<{ onClose: () => void; onStart: () => void }> = ({ onClose, onStart }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "1. Select Your Tool",
      desc: "Choose from our suite of marketing tools: Instagram Captions, WhatsApp Messages, Reels Scripts, or Festival Posts.",
      icon: Icons.LayoutGrid,
      color: "text-purple-600",
      bg: "bg-purple-100",
      visual: (
        <div className="grid grid-cols-2 gap-3 w-full max-w-[200px]">
           <div className="h-16 rounded-lg bg-purple-100 border-2 border-purple-200 flex items-center justify-center"><Icons.Instagram className="text-purple-400 w-6 h-6" /></div>
           <div className="h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"><Icons.MessageCircle className="text-slate-300 w-6 h-6" /></div>
           <div className="h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"><Icons.Film className="text-slate-300 w-6 h-6" /></div>
           <div className="h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"><Icons.PartyPopper className="text-slate-300 w-6 h-6" /></div>
        </div>
      )
    },
    {
      title: "2. Enter Details",
      desc: "Simply type your Business Name and a short topic (e.g. '50% off Sale'). Select your tone and language.",
      icon: Icons.PenTool,
      color: "text-blue-600",
      bg: "bg-blue-100",
      visual: (
        <div className="w-full max-w-[240px] space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="space-y-1">
              <div className="h-2 w-16 bg-slate-200 rounded"></div>
              <div className="h-8 w-full bg-slate-50 border border-slate-200 rounded-md"></div>
           </div>
           <div className="space-y-1">
              <div className="h-2 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-full bg-blue-50 border border-blue-200 rounded-md flex items-center px-2 text-xs text-blue-500 font-medium">Summer Sale...|</div>
           </div>
        </div>
      )
    },
    {
      title: "3. AI Magic",
      desc: "Our AI generates professional content in seconds. Just copy the best option and post it!",
      icon: Icons.Sparkles,
      color: "text-green-600",
      bg: "bg-green-100",
      visual: (
        <div className="w-full max-w-[240px] relative">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg relative z-10">
              <div className="flex justify-between mb-2">
                 <div className="h-2 w-20 bg-green-100 rounded"></div>
                 <Icons.Copy className="w-3 h-3 text-slate-400" />
              </div>
              <div className="space-y-2">
                 <div className="h-2 w-full bg-slate-100 rounded"></div>
                 <div className="h-2 w-full bg-slate-100 rounded"></div>
                 <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
              </div>
           </div>
           <div className="absolute -bottom-2 -right-2 w-full h-full bg-green-50 rounded-xl border border-green-100 -z-0"></div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="flex gap-1 p-1 absolute top-0 left-0 w-full">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#6E27FF]' : 'bg-slate-100'}`}></div>
          ))}
        </div>

        <div className="p-8 pt-12 text-center flex flex-col items-center min-h-[400px]">
           
           {/* Visual Area */}
           <div className="w-full h-48 bg-slate-50 rounded-2xl mb-8 flex items-center justify-center border border-slate-100 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="relative z-10 animate-fade-in-up">
                {currentStepData.visual}
              </div>
           </div>

           {/* Content */}
           <div className={`w-14 h-14 rounded-full ${currentStepData.bg} flex items-center justify-center mb-4 transition-colors duration-300`}>
             <Icon className={`w-7 h-7 ${currentStepData.color}`} />
           </div>
           
           <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3 animate-fade-in">
             {currentStepData.title}
           </h3>
           <p className="text-slate-500 max-w-sm mx-auto leading-relaxed animate-fade-in">
             {currentStepData.desc}
           </p>

           {/* Navigation */}
           <div className="mt-auto pt-8 flex items-center justify-between w-full gap-4">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                  Back
                </button>
              ) : (
                <div></div> // Spacer
              )}
              
              {step < steps.length - 1 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  Next <Icons.ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => { onClose(); onStart(); }}
                  className="px-6 py-2 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Start Now <Icons.Sparkles className="w-4 h-4" />
                </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeTab, setActiveTab] = useState('instagram');
  const [showDemo, setShowDemo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      {/* Demo Modal */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} onStart={() => onStart()} />}

      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <BrandLogo />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-[#6E27FF] transition-colors relative group py-2">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6E27FF] transition-all group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-[#6E27FF] transition-colors relative group py-2">
              How it Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6E27FF] transition-all group-hover:w-full"></span>
            </a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-[#6E27FF] transition-colors relative group py-2">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6E27FF] transition-all group-hover:w-full"></span>
            </a>
            <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-[#6E27FF] transition-colors relative group py-2">
              Testimonials
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6E27FF] transition-all group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => onStart()} className="hidden md:block text-slate-600 hover:text-[#6E27FF] font-medium text-sm">
              Sign In
            </button>
            <button 
              onClick={() => onStart()}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 hidden md:block"
            >
              Start Free
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-fade-in z-50">
            <div className="flex flex-col p-6 space-y-4">
              <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-lg font-medium text-slate-700 py-2 border-b border-slate-100">Features</a>
              <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="text-lg font-medium text-slate-700 py-2 border-b border-slate-100">How it Works</a>
              <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="text-lg font-medium text-slate-700 py-2 border-b border-slate-100">Pricing</a>
              <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="text-lg font-medium text-slate-700 py-2 border-b border-slate-100">Testimonials</a>
              <div className="pt-4 flex flex-col gap-3">
                 <button onClick={() => onStart()} className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-600">Sign In</button>
                 <button onClick={() => onStart()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Start Free</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 shadow-sm mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">#1 AI Marketing Tool for Indian Businesses 🇮🇳</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-5xl mx-auto animate-fade-in-up delay-100">
            AI Marketing Assistant for <br className="hidden md:block" />
            <span className="gradient-text">Your Great Business</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Create Instagram posts, WhatsApp messages, reels scripts, festival captions, and 30-day marketing plans — instantly with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <button 
              onClick={() => onStart()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Sparkles className="w-5 h-5 fill-current" />
              Start Free (No Credit Card)
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Icons.PlayCircle className="w-5 h-5" />
              View Demo
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm font-medium text-slate-500 animate-fade-in-up delay-500">
            <div className="flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-green-500" />
              Hindi, English & Hinglish
            </div>
            <div className="flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-green-500" />
              Unlimited AI Generations
            </div>
            <div className="flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-green-500" />
              Designed for India 🇮🇳
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="max-w-6xl mx-auto mt-20 relative z-10 animate-fade-in-up delay-700">
          <div className="relative rounded-3xl bg-slate-900 p-2 shadow-2xl border border-slate-800">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-sm"></div>
             <div className="rounded-2xl overflow-hidden bg-slate-50 relative aspect-[16/9] md:aspect-[16/8] flex">
                
                {/* Mock Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 gap-2">
                   <div className="flex items-center gap-2 mb-6 px-2">
                      <div className="w-6 h-6 rounded bg-purple-600"></div>
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                   </div>
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className={`h-8 w-full rounded-lg ${i===1 ? 'bg-purple-50 border border-purple-100' : 'bg-transparent'} flex items-center px-2 gap-3`}>
                        <div className={`w-4 h-4 rounded ${i===1 ? 'bg-purple-400' : 'bg-slate-200'}`}></div>
                        <div className={`h-2.5 rounded ${i===1 ? 'w-20 bg-purple-300' : 'w-24 bg-slate-100'}`}></div>
                     </div>
                   ))}
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-6 md:p-10 bg-[#F8FAFC]">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
                         <div className="h-3 w-32 bg-slate-100 rounded"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Icons.Instagram className="w-6 h-6 text-purple-500" />
                         </div>
                         <div className="h-10 w-10 bg-purple-100 rounded-xl mb-4"></div>
                         <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                         <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Icons.MessageCircle className="w-6 h-6 text-green-500" />
                         </div>
                         <div className="h-10 w-10 bg-green-100 rounded-xl mb-4"></div>
                         <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                         <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Icons.PartyPopper className="w-6 h-6 text-orange-500" />
                         </div>
                         <div className="h-10 w-10 bg-orange-100 rounded-xl mb-4"></div>
                         <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                         <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                      </div>
                   </div>

                   {/* Floating Cards Animation */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
                      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 transform translate-x-8 translate-y-8 animate-float delay-100">
                          <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                             <div className="h-3 w-24 bg-slate-100 rounded"></div>
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 w-full bg-slate-100 rounded"></div>
                             <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                             <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                          </div>
                          <div className="mt-4 flex gap-2">
                             <div className="h-6 w-16 bg-purple-100 rounded-full"></div>
                             <div className="h-6 w-16 bg-blue-100 rounded-full"></div>
                          </div>
                      </div>
                   </div>
                   
                   <div className="absolute top-1/3 right-10 md:right-20">
                      <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <Icons.Check className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                             <div className="text-xs font-bold text-slate-800">Generated Successfully</div>
                          </div>
                      </div>
                   </div>

                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Partner / Social Proof */}
      <section className="py-10 border-y border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by 5,000+ local business owners</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {['Salons', 'Gyms', 'Cafes', 'Boutiques', 'Clinics'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xl font-bold font-heading text-slate-800">
                   <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                      <Icons.Store className="w-4 h-4 text-slate-500" />
                   </div>
                   {item}
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* 4. What The App Does (Features) */}
      <section id="features" className="py-24 px-6 relative scroll-mt-24">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4">Everything you need to <br/><span className="gradient-text">grow your business online</span></h2>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto">Stop struggling with content ideas. Let AI handle your marketing while you handle your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 {
                   icon: Icons.Instagram,
                   color: 'purple',
                   title: 'Instagram Posts',
                   features: ['Captions', 'Hashtags', 'Viral Hooks', 'Offer Posts']
                 },
                 {
                   icon: Icons.MessageCircle,
                   color: 'green',
                   title: 'WhatsApp Marketing',
                   features: ['Bulk Messages', 'Festival Wishes', 'Follow-ups', 'Offer Blasts']
                 },
                 {
                   icon: Icons.Film,
                   color: 'pink',
                   title: 'Reels Scripts',
                   features: ['30s Scripts', 'Shot-by-Shot', 'Trending Audio', 'CTA Lines']
                 },
                 {
                   icon: Icons.PartyPopper,
                   color: 'orange',
                   title: 'Festival Content',
                   features: ['Posters', 'Wishes', 'Status Updates', 'Calendar']
                 }
               ].map((card, idx) => (
                 <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
                    <div className={`w-14 h-14 rounded-2xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                       <card.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{card.title}</h3>
                    <ul className="space-y-3">
                       {card.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-slate-600 text-sm">
                             <div className={`w-1.5 h-1.5 rounded-full bg-${card.color}-400`}></div>
                             {feat}
                          </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. Premium Features */}
      <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
         {/* Decorative background */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/20 to-transparent"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0F172A] to-transparent z-10"></div>
         
         <div className="max-w-7xl mx-auto relative z-20">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
               <div className="max-w-2xl">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                     Pro Features
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Upgrade to unlock <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Powerful Marketing Tools</span></h2>
                  <p className="text-slate-400 text-lg">Take your business to the next level with advanced features designed for growth.</p>
               </div>
               <button onClick={() => onStart()} className="flex items-center gap-2 text-white border border-white/20 hover:bg-white/10 px-6 py-3 rounded-full transition-all">
                  Unlock Premium <Icons.ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Card 1 */}
               <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Icons.CalendarDays className="w-8 h-8" /></div>
                     <Icons.Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">30-Day Marketing Plan</h3>
                  <p className="text-slate-400 text-sm mb-6">Get a full month's content calendar instantly. Day-by-day plan for Instagram, Facebook & WhatsApp.</p>
                  <div className="space-y-2">
                     <div className="h-2 w-full bg-white/10 rounded"></div>
                     <div className="h-2 w-full bg-white/10 rounded"></div>
                     <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                  </div>
               </div>

               {/* Card 2 */}
               <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><Icons.MapPin className="w-8 h-8" /></div>
                     <Icons.Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Google Business Booster</h3>
                  <p className="text-slate-400 text-sm mb-6">Rank higher on Google Maps. Generate SEO descriptions, FAQs, and professional review replies.</p>
                  <div className="flex gap-2 mb-2">
                     <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                     <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                     <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                     <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                     <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded"></div>
               </div>

               {/* Card 3 */}
               <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Icons.LayoutTemplate className="w-8 h-8" /></div>
                     <Icons.Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Poster Copy Generator</h3>
                  <p className="text-slate-400 text-sm mb-6">Create catchy headlines, subheadlines, and CTAs for your festival posters and ads.</p>
                  <div className="text-center p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
                     <div className="h-4 w-3/4 mx-auto bg-amber-400/20 rounded mb-2"></div>
                     <div className="h-2 w-1/2 mx-auto bg-white/10 rounded"></div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5.5 Coming Soon Section */}
      <div className="px-6 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto">
           <ComingSoonSection />
        </div>
      </div>

      {/* 6. How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white scroll-mt-24">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4">How it works</h2>
               <p className="text-lg text-slate-600">Three simple steps to automate your marketing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
               
               {[
                  { title: "Enter Business Details", desc: "Select your business type and name.", icon: Icons.Store },
                  { title: "Choose What To Create", desc: "Pick Instagram, WhatsApp, or Reels.", icon: Icons.Wand2 },
                  { title: "Copy & Post", desc: "Get AI results instantly & share.", icon: Icons.Share2 }
               ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center mb-8 relative z-10">
                        <step.icon className="w-10 h-10 text-[#6E27FF]" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#6E27FF] text-white flex items-center justify-center font-bold border-4 border-white">
                           {idx + 1}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                     <p className="text-slate-600 max-w-xs">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 7. Live Demo Preview */}
      <section className="py-24 px-6 bg-[#F7F9FC]">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Try it yourself</h2>
               <div className="flex justify-center gap-4 mb-8">
                  {['Instagram', 'WhatsApp', 'Festival', 'Reels'].map(tab => (
                     <button 
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                           activeTab === tab.toLowerCase() 
                           ? 'bg-slate-900 text-white shadow-lg' 
                           : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
               <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
                           <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-500">Glow Beauty Salon</div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Offer / Topic</label>
                           <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-500">50% off on Bridal Makeup this weekend</div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Tone</label>
                           <div className="flex gap-3">
                              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">Friendly</div>
                              <div className="px-4 py-2 bg-white text-slate-500 rounded-lg text-sm font-medium border border-slate-200">Professional</div>
                           </div>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                           <Icons.Sparkles className="w-4 h-4" /> Generate Content
                        </button>
                     </div>
                  </div>
                  <div className="p-8 md:p-12 bg-white relative">
                     {/* Abstract representation of result */}
                     <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-xs font-bold text-slate-400 uppercase">AI Output</span>
                           </div>
                           <Icons.Copy className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                        <div className="h-4 w-full bg-slate-100 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                        <div className="h-20 w-full bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                           <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                           <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex gap-2 pt-2">
                           <div className="h-6 w-16 bg-blue-50 rounded-full"></div>
                           <div className="h-6 w-20 bg-blue-50 rounded-full"></div>
                           <div className="h-6 w-14 bg-blue-50 rounded-full"></div>
                        </div>
                     </div>
                     
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <button onClick={() => onStart()} className="px-8 py-3 bg-[#6E27FF] text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                           Try Real App Now
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white border-t border-slate-100 scroll-mt-24">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4">Simple, honest pricing</h2>
               <p className="text-lg text-slate-600">Start for free, upgrade as you grow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
               {/* FREE */}
               <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all">
                  <h3 className="font-bold text-xl mb-2">Free Plan</h3>
                  <div className="text-3xl font-bold mb-6">₹0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                  <ul className="space-y-4 mb-8 text-sm text-slate-600">
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> 5 generations/day</li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> Short captions</li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> Basic WhatsApp msgs</li>
                     <li className="flex gap-2"><Icons.X className="w-4 h-4 text-slate-300" /> No Calendar</li>
                  </ul>
                  <button onClick={() => onStart()} className="w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-colors">Start Free</button>
               </div>

               {/* STARTER */}
               <div className="p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-xl transition-all">
                  <h3 className="font-bold text-xl mb-2">Starter</h3>
                  <div className="text-3xl font-bold mb-6">₹199 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
                  <ul className="space-y-4 mb-8 text-sm text-slate-600">
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> 100 generations</li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> No ads</li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-green-500" /> Save projects</li>
                     <li className="flex gap-2"><Icons.X className="w-4 h-4 text-slate-300" /> No Calendar</li>
                  </ul>
                  <button onClick={() => onStart()} className="w-full py-3 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors">Upgrade</button>
               </div>

               {/* GROWTH (Highlighted) */}
               <div className="p-8 rounded-3xl border-2 border-[#6E27FF] bg-white shadow-2xl relative transform lg:-translate-y-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6E27FF] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                  <h3 className="font-bold text-xl mb-2 text-[#6E27FF]">Growth</h3>
                  <div className="text-3xl font-bold mb-6">₹499 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
                  <ul className="space-y-4 mb-8 text-sm text-slate-600">
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-[#6E27FF]" /> <strong>Unlimited AI</strong></li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-[#6E27FF]" /> Long Captions & Hooks</li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-[#6E27FF]" /> <strong>30-Day Calendar</strong></li>
                     <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-[#6E27FF]" /> Google My Business</li>
                  </ul>
                  <button onClick={() => onStart()} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] text-white font-bold hover:opacity-90 transition-opacity shadow-lg">Go Pro</button>
               </div>

            </div>
         </div>
      </section>

      {/* 9. Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#F7F9FC] scroll-mt-24">
         <div className="max-w-7xl mx-auto text-center">
             <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-16">Loved by Indian Businesses</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                 {[
                    { name: "Riya Patel", biz: "Shree Sai Salon, Pune", text: "I used to spend hours thinking of captions. Now I generate my whole week's content in 5 minutes. Best investment!", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya&gender=female" },
                    { name: "Manoj Kumar", biz: "FitZone Gym, Mumbai", text: "The reels scripts are amazing. My views increased by 200% after using the hook ideas from Unlockify.in.", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj&gender=male" },
                    { name: "Sonal Shah", biz: "Tasty Bites Cafe, Ahmedabad", text: "The festival posters and WhatsApp wishes help me stay connected with my customers during every festival. Highly recommended!", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonal&gender=female" },
                 ].map((t, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-shadow border border-slate-100">
                        <div className="flex gap-1 mb-4">
                           {[1,2,3,4,5].map(s => <Icons.Star key={s} className="w-4 h-4 text-yellow-400 fill-current" />)}
                        </div>
                        <p className="text-slate-700 mb-6 italic">"{t.text}"</p>
                        <div className="flex items-center gap-4">
                           <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full bg-slate-100" />
                           <div>
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-xs text-slate-500">{t.biz}</div>
                           </div>
                        </div>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
               {[
                  { q: "Is the Free Plan really free?", a: "Yes! You get 5 free AI generations every single day. No credit card required." },
                  { q: "Can I generate content in Hindi?", a: "Absolutely. We support Hindi, English, and Hinglish (mixed) which works best for social media." },
                  { q: "How does the 30-day calendar work?", a: "On the Paid plan, you can generate a full month's content strategy with topics and captions in one click." },
                  { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from your dashboard. No questions asked." }
               ].map((item, idx) => (
                  <details key={idx} className="group bg-slate-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                     <summary className="flex items-center justify-between font-bold text-slate-900">
                        {item.q}
                        <Icons.ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                     </summary>
                     <p className="mt-4 text-slate-600 leading-relaxed">
                        {item.a}
                     </p>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* 11. Final CTA */}
      <section className="py-24 px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] rounded-[2.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            {/* sparkles */}
            <div className="absolute top-10 left-10 text-white/20"><Icons.Sparkles className="w-12 h-12" /></div>
            <div className="absolute bottom-10 right-10 text-white/20"><Icons.Sparkles className="w-8 h-8" /></div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6 relative z-10">Ready to boost your business?</h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">Join thousands of Indian business owners creating smarter content today.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
               <button onClick={() => onStart()} className="w-full sm:w-auto px-8 py-4 bg-white text-[#6E27FF] rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
                  Start Free Now
               </button>
            </div>
         </div>
      </section>

      {/* 12. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <BrandLogo theme="dark" withText={true} />
               </div>
               <p className="max-w-xs">The #1 AI Marketing Assistant for small local businesses in India. Simple, fast, and affordable.</p>
               
               {/* Admin Login Link */}
               <div className="mt-6">
                 <button 
                   onClick={() => onStart('admin@unlockify.in')}
                   className="text-xs text-slate-600 hover:text-slate-300 transition-colors flex items-center gap-1"
                 >
                   <Icons.Lock className="w-3 h-3" /> Admin Login
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <h4 className="font-bold text-white mb-4">Product</h4>
                  <ul className="space-y-2 text-sm">
                     <li><a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-white transition-colors">Features</a></li>
                     <li><a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-white transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-white mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm">
                     <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  </ul>
               </div>
            </div>

            <div>
               <h4 className="font-bold text-white mb-4">Connect</h4>
               <div className="flex gap-4 mb-6">
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#6E27FF] hover:text-white transition-colors"><Icons.Instagram className="w-5 h-5" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#6E27FF] hover:text-white transition-colors"><Icons.Youtube className="w-5 h-5" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#6E27FF] hover:text-white transition-colors"><Icons.Twitter className="w-5 h-5" /></a>
               </div>
               <p className="text-sm">Made with ❤️ in India 🇮🇳</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

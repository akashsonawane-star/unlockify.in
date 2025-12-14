
import React, { useState } from 'react';
import { ViewState } from '../types';
import * as Icons from 'lucide-react';

interface SupportPageProps {
  onNavigate: (view: ViewState) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Mock submission
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <button 
        onClick={() => onNavigate('profile')} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <Icons.ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-500 mt-2">We are here to help you grow. Reach out to us anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                 <Icons.Mail className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
                 <p className="text-sm text-slate-500 mb-2">Typically replies within 24 hours.</p>
                 <a href="mailto:support@unlockify.in" className="text-[#6E27FF] font-bold hover:underline">support@unlockify.in</a>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                 <Icons.Phone className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-900 mb-1">Phone / WhatsApp</h3>
                 <p className="text-sm text-slate-500 mb-2">Mon-Fri, 10am - 6pm IST.</p>
                 <a href="tel:+919876543210" className="text-[#6E27FF] font-bold hover:underline">+91 98765 43210</a>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                 <Icons.MapPin className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-900 mb-1">Office Address</h3>
                 <p className="text-sm text-slate-500">
                    Unlockify Solutions Pvt Ltd,<br/>
                    Sector 44, Gurgaon,<br/>
                    Haryana, India - 122003
                 </p>
              </div>
           </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <Icons.Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500 mt-2">Thanks for reaching out. We will get back to you shortly.</p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-[#6E27FF] font-bold hover:underline text-sm"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Send a Message</h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                        <select 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none"
                            required
                        >
                            <option value="">Select a topic</option>
                            <option value="billing">Billing & Subscription</option>
                            <option value="bug">Report a Bug</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-[#6E27FF] focus:ring-[#6E27FF] outline-none resize-none"
                            placeholder="Describe your issue..."
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        Send Message <Icons.Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>

      </div>
    </div>
  );
};

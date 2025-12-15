import React, { useState, useEffect, useRef } from 'react';
import { FeatureType, FormData, UserPlan } from '../types';
import { BUSINESS_TYPES } from '../constants';
import { Loader2, Sparkles, Lock, Upload, X, Image as ImageIcon, Mic, Clapperboard } from 'lucide-react';

interface ContentFormProps {
  feature: FeatureType;
  userPlan: UserPlan;
  isLoading: boolean;
  onSubmit: (data: FormData) => void;
  initialData?: FormData | null;
}

export const ContentForm: React.FC<ContentFormProps> = ({ feature, userPlan, isLoading, onSubmit, initialData }) => {
  // Determine if feature is locked
  const isLocked = (feature === 'calendar' || feature === 'gmb') && userPlan === 'free';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    businessType: 'Salon',
    businessName: '',
    city: '',
    language: 'Hinglish',
    tone: 'Friendly',
    offerDetails: '',
    festivalName: '',
    duration: '15s',
    objective: 'Awareness',
    hookStyle: 'Emotional',
    targetAudience: 'General Public',
    voiceGender: 'Female',
    visualStyle: 'Cinematic Live Action',
    logo: ''
  });

  // Reset or Set form
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({
          ...prev, 
          offerDetails: '', 
          festivalName: '' 
      }));
    }
  }, [feature, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Logo file is too large. Please upload an image under 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm min-h-[400px]">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Premium Feature Locked</h3>
        <p className="text-slate-500 mb-8 max-w-md">
          {feature === 'calendar' ? '30-Day Marketing Calendars' : 'Google My Business Management'} are available exclusively on the Growth Plan.
        </p>
        <button disabled className="bg-gradient-to-r from-slate-300 to-slate-400 text-white px-8 py-3 rounded-full font-bold cursor-not-allowed">
           Switch Simulator to "Paid" to Unlock
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Business Type */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Business Category</label>
          <select 
            name="businessType" 
            value={formData.businessType} 
            onChange={handleChange}
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 transition-all outline-none"
          >
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g. Glow Salon"
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Mumbai"
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
          <select 
            name="language" 
            value={formData.language} 
            onChange={handleChange}
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
          >
            <option value="Hinglish">Hinglish (Mix)</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tone</label>
          <select 
            name="tone" 
            value={formData.tone} 
            onChange={handleChange}
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
          >
            <option value="Friendly">Friendly & Welcoming</option>
            <option value="Professional">Professional</option>
            <option value="Fun">Fun & Trendy</option>
            <option value="Energetic">Energetic & Hype</option>
            <option value="Inspirational">Inspirational / Motivational</option>
            <option value="Urgent">Urgent (FOMO)</option>
            <option value="Luxury">Luxury / Elegant</option>
            <option value="Casual">Casual / Chill</option>
            <option value="Witty">Witty / Sarcastic</option>
            <option value="Empathetic">Empathetic / Soft</option>
            <option value="Bold">Bold / Assertive</option>
            <option value="Dramatic">Dramatic / Storytelling</option>
          </select>
        </div>
        
        {/* Objective - Insta/Reels/Poster */}
        {(feature === 'instagram' || feature === 'reels' || feature === 'poster') && (
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Goal</label>
            <select 
                name="objective" 
                value={formData.objective} 
                onChange={handleChange}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
            >
                <option value="Awareness">Brand Awareness</option>
                <option value="Sales/Offer">Sales / Offer</option>
                <option value="Engagement">Engagement</option>
                <option value="Educational">Educational</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Brand Building">Brand Building</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Product Showcase">Product Showcase</option>
                <option value="Behind the Scenes">Behind the Scenes</option>
                <option value="Testimonial">Testimonial / Review</option>
                <option value="Event Promotion">Event Promotion</option>
                <option value="Hiring">Hiring / Recruitment</option>
                <option value="Community Building">Community Building</option>
            </select>
            </div>
        )}

        {/* Hook Style - Reels Only */}
        {feature === 'reels' && (
             <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Hook Style</label>
             <select 
                 name="hookStyle" 
                 value={formData.hookStyle} 
                 onChange={handleChange}
                 className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
             >
                 <option value="Emotional">Emotional / Relatable</option>
                 <option value="Question">Question / Curiosity</option>
                 <option value="Funny">Funny / Skit</option>
                 <option value="Controversial">Bold Statement / Controversial</option>
                 <option value="Secret">Secret / Insider Info</option>
                 <option value="Mistake">Common Mistake</option>
                 <option value="Visual Shock">Visual Shock</option>
                 <option value="Negative Warning">Negative Warning (Stop Doing This)</option>
                 <option value="Storytime">Storytime</option>
                 <option value="Challenge">Challenge</option>
                 <option value="Life Hack">Life Hack</option>
                 <option value="Transformation">Transformation (Before/After)</option>
                 <option value="Myth Buster">Myth Buster</option>
                 <option value="POV">POV (Point of View)</option>
                 <option value="Did You Know">Did You Know? (Fact)</option>
                 <option value="Unpopular Opinion">Unpopular Opinion</option>
                 <option value="Comparison">Comparison (This vs That)</option>
                 <option value="Trend Alert">Trend Alert</option>
                 <option value="ASMR">ASMR / Satisfying</option>
             </select>
             </div>
        )}

        {/* Duration (Only for Reels) */}
        {feature === 'reels' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
            <select 
              name="duration" 
              value={formData.duration} 
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
            >
              <option value="15s">15 Seconds</option>
              <option value="30s">30 Seconds</option>
              <option value="45s">45 Seconds (Pro)</option>
            </select>
          </div>
        )}

        {/* REELS SPECIFIC CONFIGS (Voice/Style) */}
        {feature === 'reels' && (
          <>
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                 <Mic className="w-4 h-4 text-purple-600" /> Voice Gender
               </label>
               <select 
                 name="voiceGender" 
                 value={formData.voiceGender} 
                 onChange={handleChange}
                 className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
               >
                 <option value="Female">Female</option>
                 <option value="Male">Male</option>
                 <option value="Duo">Duo (Male & Female)</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                 <Clapperboard className="w-4 h-4 text-purple-600" /> Visual Style
               </label>
               <select 
                 name="visualStyle" 
                 value={formData.visualStyle} 
                 onChange={handleChange}
                 className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
               >
                 <option value="Cinematic Live Action">Cinematic Live Action</option>
                 <option value="3D Animation">3D Animation</option>
                 <option value="2D Vector Animation">2D Vector Animation</option>
                 <option value="Minimalist">Minimalist / Text-focused</option>
                 <option value="UGC Style">UGC / Selfie Style</option>
                 <option value="Luxury Aesthetic">Luxury Aesthetic</option>
               </select>
             </div>
          </>
        )}

        {/* Festival Name (Only for Festival) */}
        {feature === 'festival' && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Festival / Occasion</label>
            <input
              type="text"
              name="festivalName"
              value={formData.festivalName}
              onChange={handleChange}
              placeholder="e.g. Diwali, New Year, Republic Day"
              className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none"
            />
          </div>
        )}

      </div>
      
      {/* Logo Upload Section */}
      <div>
         <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Logo (Optional)</label>
         <div className="flex items-center gap-4">
            {formData.logo ? (
                <div className="relative group">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center overflow-hidden">
                        <img src={formData.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button 
                        type="button" 
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-[#6E27FF] hover:text-[#6E27FF] hover:bg-purple-50 transition-all"
                >
                    <Upload className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1">Logo</span>
                </div>
            )}
            <div className="flex-1">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
                {!formData.logo && (
                    <div className="text-xs text-slate-500">
                        Upload your business logo. We will automatically add it to generated images.
                    </div>
                )}
                {formData.logo && (
                    <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Logo added! It will be overlaid on your designs.
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* Offer Details / Topic */}
      {feature !== 'calendar' && feature !== 'gmb' && (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
            {feature === 'festival' ? 'Message / Wishes Detail' : 'Topic / Offer Details'}
            </label>
            <textarea
            name="offerDetails"
            value={formData.offerDetails}
            onChange={handleChange}
            rows={4}
            placeholder={feature === 'festival' ? "e.g. Wishing peace and prosperity to all our customers." : "e.g. 50% Flat off on Bridal Makeup. Valid till Sunday."}
            required
            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 focus:border-[#6E27FF] focus:ring-[#6E27FF] text-slate-700 outline-none resize-none"
            ></textarea>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-[#6E27FF] to-[#3F8CFF] hover:opacity-90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating AI Magic...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2 fill-current" />
            Generate Content
          </>
        )}
      </button>
    </form>
  );
};
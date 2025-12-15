
export type UserPlan = 'free' | 'paid';

export type FeatureType = 
  | 'instagram' 
  | 'whatsapp' 
  | 'reels' 
  | 'festival' 
  | 'calendar' 
  | 'gmb' 
  | 'poster';

export type ViewState = 
  | 'dashboard' 
  | 'saved' 
  | 'profile' 
  | 'subscription'
  | 'support'
  | 'terms'
  | 'admin' // New Admin State
  | FeatureType;

export type Language = 'Hindi' | 'English' | 'Hinglish';

export type Tone = 
  | 'Friendly' 
  | 'Professional' 
  | 'Fun' 
  | 'Energetic' 
  | 'Inspirational' 
  | 'Urgent' 
  | 'Luxury' 
  | 'Casual' 
  | 'Witty'
  | 'Empathetic'
  | 'Bold'
  | 'Dramatic';

export type Objective = 
  | 'Awareness' 
  | 'Sales/Offer' 
  | 'Engagement' 
  | 'Educational' 
  | 'Entertainment' 
  | 'Brand Building' 
  | 'Lead Generation' 
  | 'Product Showcase' 
  | 'Behind the Scenes' 
  | 'Testimonial'
  | 'Event Promotion'
  | 'Hiring'
  | 'Community Building';

export type HookStyle = 
  | 'Question' 
  | 'Controversial' 
  | 'Emotional' 
  | 'Funny' 
  | 'Secret' 
  | 'Mistake' 
  | 'Visual Shock' 
  | 'Negative Warning' 
  | 'Storytime' 
  | 'Challenge' 
  | 'Life Hack' 
  | 'Transformation' 
  | 'Myth Buster'
  | 'POV'
  | 'Did You Know'
  | 'Unpopular Opinion'
  | 'Comparison'
  | 'Trend Alert'
  | 'ASMR';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  city: string;
  defaultLanguage: Language;
}

export interface FormData {
  businessType: string;
  businessName: string;
  city: string;
  language: Language;
  tone: Tone;
  offerDetails: string;
  festivalName?: string;
  duration?: '15s' | '30s' | '45s';
  objective?: Objective;
  hookStyle?: HookStyle;
  targetAudience?: string;
  logo?: string; // Base64 string of the logo
  voiceGender?: 'Male' | 'Female' | 'Duo';
  visualStyle?: 'Cinematic Live Action' | '3D Animation' | '2D Vector Animation' | 'Minimalist' | 'UGC Style' | 'Luxury Aesthetic';
}

export interface AIResponseData {
  success: boolean;
  type: string;
  user_plan: UserPlan;
  data: any;
  upgrade_note?: string;
  error?: boolean;
  code?: string;
  message?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  feature: FeatureType;
  input: FormData;
  output: AIResponseData;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<boolean>;
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}

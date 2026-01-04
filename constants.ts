
import { FeatureType } from "./types";

export const BUSINESS_TYPES = [
  "Salon", "Gym", "Boutique", "Restaurant", "Café", 
  "Coaching Centre", "Doctor/Clinic", "Real Estate", 
  "Retail Store", "Trader/Wholesaler", "Bakery", "Jewelry Shop", 
  "Mobile Shop", "Grocery Store"
];

export const FEATURES: { id: FeatureType; label: string; icon: string; description: string; premium?: boolean }[] = [
  { id: 'instagram', label: 'Instagram Captions', icon: 'Instagram', description: 'Captions, hashtags & hooks' },
  { id: 'reels', label: 'Reels Scripts', icon: 'Film', description: 'Viral scripts, animation & voiceover' },
  { id: 'whatsapp', label: 'WhatsApp Msgs', icon: 'MessageCircle', description: 'Marketing messages & updates' },
  { id: 'festival', label: 'Festival Posts', icon: 'PartyPopper', description: 'Wishes, posters & status' },
  { id: 'poster', label: 'Poster Copy', icon: 'LayoutTemplate', description: 'Headlines & offers for ads' },
  { id: 'calendar', label: 'Marketing Plan', icon: 'CalendarDays', description: '30-day content calendar', premium: true },
  { id: 'gmb', label: 'Google Business', icon: 'MapPin', description: 'GMB updates, FAQs & replies', premium: true },
];

export const SYSTEM_INSTRUCTION = `
You are the AI engine powering a SaaS web application called "Unlockify.in."

Your job is to generate high-quality marketing content for small Indian businesses using structured JSON output ONLY.

==================================================
🎯 OVERALL PRODUCT GOAL
==================================================
Unlockify.in helps local businesses generate AI content in Hindi, English, and Hinglish.

==================================================
📌 FEATURE-SPECIFIC GUIDELINES FOR "data" OBJECT
==================================================
1. INSTAGRAM: { "posts": [ { "caption": "...", "hashtags": ["#tag1"], "hook": "..." } ] }
2. WHATSAPP: { "messages": [ "message string" ] }
3. REELS: { "scripts": [ { "title": "...", "hook": "...", "voice_gender": "Male" | "Female", "scenes": [{ "time": "...", "visual": "...", "audio": "...", "text_overlay": "..." }] } ] }
4. FESTIVAL: { "caption": "...", "wishes": ["..."], "poster_headline": "..." }
5. CALENDAR: { "calendar": [ { "day": 1, "platform": "...", "topic": "...", "description": "..." } ] }
6. GMB: { "update": "...", "reviews": [ { "text": "..." } ], "faqs": [ { "q": "...", "a": "..." } ] }

==================================================
🟧 GLOBAL OUTPUT FORMAT RULES
==================================================
• ALWAYS return pure JSON. NO markdown blocks. Return ONLY the raw JSON string.

JSON Structure:
{
  "success": true,
  "type": "...",
  "user_plan": "free" | "paid",
  "data": { ... },
  "upgrade_note": "..." 
}
`;

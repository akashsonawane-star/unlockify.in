
import React, { useState } from 'react';
import { AIResponseData, FeatureType, FormData } from '../types';
import { Copy, AlertCircle, Check, Film, MapPin, Download, RefreshCw, ClipboardList, Share2, Image as ImageIcon, Loader2, Instagram, MessageCircle, Send } from 'lucide-react';
import { generateMarketingImage } from '../services/geminiService';

interface ResultDisplayProps {
  result: AIResponseData;
  feature: FeatureType;
  onRegenerate: () => void;
  isRegenerating: boolean;
  formData: FormData | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, feature, onRegenerate, isRegenerating, formData }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isCopyingAll, setIsCopyingAll] = useState(false);
  
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-red-700">{result.code || "Generation Failed"}</h3>
        <p className="text-red-600 mt-1">{result.message}</p>
        <button 
           onClick={onRegenerate} 
           disabled={isRegenerating}
           className="mt-4 flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
        >
           <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} /> Try Again
        </button>
      </div>
    );
  }

  const { data } = result;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleWhatsAppShare = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleInstagramPost = (text: string) => {
    navigator.clipboard.writeText(text);
    window.open('https://instagram.com', '_blank');
    alert("Caption copied to clipboard! Paste it when Instagram opens.");
  };

  const getCopyAllText = () => {
    if (!data) return "";
    let textToCopy = "";

    if (feature === 'instagram') {
      const posts = Array.isArray(data.posts) ? data.posts : (data.caption ? [data] : []);
      textToCopy = posts.map((p: any, i: number) => 
        `Option ${i + 1}:\n${p.hook ? `Hook: ${p.hook}\n` : ''}${p.caption}\n${Array.isArray(p.hashtags) ? p.hashtags.join(' ') : p.hashtags}`
      ).join('\n\n---\n\n');
    } 
    else if (feature === 'whatsapp') {
      const messages = Array.isArray(data.messages) ? data.messages : (data.variants || []);
      textToCopy = messages.map((m: any, i: number) => {
         const content = typeof m === 'string' ? m : m.text || m.content;
         return `Variant ${i + 1}:\n${content}`;
      }).join('\n\n---\n\n');
    }
    else if (feature === 'reels') {
      const scripts = Array.isArray(data.scripts) ? data.scripts : [data];
      textToCopy = scripts.map((s: any, i: number) => {
        let scriptContent = "";
        if (s.scenes) {
            scriptContent = s.scenes.map((scene: any) => `[${scene.time}] Visual: ${scene.visual} | Audio: ${scene.audio}`).join('\n');
        } else {
            scriptContent = s.script || s.content;
        }
        return `Script ${i + 1}: ${s.title || ''}\nHook: ${s.hook || ''}\n\n${scriptContent}\n\nCTA: ${s.cta || ''}`;
      }).join('\n\n---\n\n');
    }
    else if (feature === 'festival') {
       textToCopy += `Caption:\n${data.caption}\n\n`;
       if (data.wishes) {
           textToCopy += `Wishes:\n${data.wishes.join('\n\n')}\n\n`;
       }
       if (data.poster_headline) {
           textToCopy += `Poster:\nHeadline: ${data.poster_headline}\nSub: ${data.poster_subheadline || ''}`;
       }
    }
    else if (feature === 'calendar') {
        textToCopy = (data.calendar || []).map((d: any) => `Day ${d.day} (${d.platform}): ${d.topic}\n${d.description}`).join('\n\n');
    }
    else if (feature === 'gmb') {
        textToCopy = `Business Description:\n${data.business_description}\n\nFAQs:\n${(data.faqs || []).map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`;
    }
    else {
        textToCopy = JSON.stringify(data, null, 2);
    }
    
    return textToCopy;
  };

  const handleCopyAll = () => {
    const text = getCopyAllText();
    navigator.clipboard.writeText(text);
    setIsCopyingAll(true);
    setTimeout(() => setIsCopyingAll(false), 2000);
  };

  const handleShare = async (text?: string) => {
    const contentToShare = text || getCopyAllText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Unlockify Content',
          text: contentToShare,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard and alert
      navigator.clipboard.writeText(contentToShare);
      alert('Content copied to clipboard! Open Instagram or WhatsApp to paste.');
    }
  };

  const addLogoToImage = (bgUrl: string, logoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const bg = new Image();
      const logo = new Image();
      
      // Cross origin might not be needed for data URLs but good practice
      bg.crossOrigin = "anonymous";
      logo.crossOrigin = "anonymous";
      
      bg.onload = () => {
        canvas.width = bg.width;
        canvas.height = bg.height;
        ctx?.drawImage(bg, 0, 0);
        
        logo.onload = () => {
          // Logo size: 12% of width (Reduced from 20%)
          const logoWidth = bg.width * 0.12;
          const scale = logoWidth / logo.width;
          const logoHeight = logo.height * scale;
          
          // Position: Bottom Right with padding (4% padding)
          const padding = bg.width * 0.04;
          const x = bg.width - logoWidth - padding;
          const y = bg.height - logoHeight - padding;
          
          if (ctx) {
            // Optional: Add a slight drop shadow to the logo
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          }
          resolve(canvas.toDataURL('image/png'));
        };
        // Handle logo error (just return bg)
        logo.onerror = () => resolve(bgUrl);
        logo.src = logoUrl;
      };
      
      bg.onerror = () => resolve(bgUrl);
      bg.src = bgUrl;
    });
  };

  const handleCreateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImage(null);

    // 1. Determine Aspect Ratio based on feature
    // Reels/Festival = 9:16 (Portrait), Instagram/Poster = 1:1 (Square)
    const ratio = (feature === 'reels' || feature === 'festival') ? '9:16' : '1:1';

    // 2. Build a prompt based on the generated data
    let imagePrompt = "";
    
    // Extract key details safely
    if (feature === 'festival') {
       imagePrompt = `A festival poster for ${data.poster_headline || 'Celebration'}. Festive atmosphere, vibrant colors, text overlay area available.`;
    } else if (feature === 'instagram') {
       const caption = data.posts?.[0]?.caption || data.caption || "";
       imagePrompt = `A lifestyle photo for instagram. Context: ${caption.substring(0, 100)}. Aesthetic, high quality, minimal text.`;
    } else if (feature === 'reels') {
       const hook = data.scripts?.[0]?.hook || data.hook || "Viral content";
       imagePrompt = `A vertical video cover image or background for a reel. Theme: ${hook}. Engaging, cinematic lighting.`;
    } else {
       imagePrompt = `A professional marketing image for a business. Modern, clean design.`;
    }

    // 3. Call Service
    let imageUrl = await generateMarketingImage(imagePrompt, ratio);
    
    if (!imageUrl) {
        alert("Sorry, we couldn't generate the image at this moment. Please try again later.");
        setIsGeneratingImage(false);
        return;
    }

    // 4. Overlay Logo if present in formData
    if (formData?.logo) {
      try {
        const compositedImage = await addLogoToImage(imageUrl, formData.logo);
        imageUrl = compositedImage;
      } catch (e) {
        console.error("Failed to add logo", e);
      }
    }

    setGeneratedImage(imageUrl);
    setIsGeneratingImage(false);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button 
      onClick={() => handleCopy(text, id)}
      className="absolute top-3 right-3 p-2 text-slate-400 hover:text-[#6E27FF] hover:bg-purple-50 rounded-lg transition-colors"
      title="Copy to Clipboard"
    >
      {copiedIndex === id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  const renderContent = () => {
    switch (feature) {
      case 'instagram':
        const posts = Array.isArray(data.posts) ? data.posts : (data.caption ? [data] : []);
        return (
          <div className="space-y-6">
             {posts.map((post: any, idx: number) => {
                const postText = `${post.hook ? post.hook + '\n\n' : ''}${post.caption}\n\n${Array.isArray(post.hashtags) ? post.hashtags.join(' ') : post.hashtags}`;
                return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                   <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option {idx + 1}</span>
                      <div className="flex gap-2">
                        {post.hook && <span className="text-xs font-medium text-[#6E27FF]">🪝 Hook Included</span>}
                        <button onClick={() => handleShare(postText)} className="md:hidden text-slate-400 hover:text-blue-600"><Share2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="p-6">
                      {post.title && <h4 className="font-bold text-slate-800 mb-3 text-lg">{post.title}</h4>}
                      
                      {post.hook && (
                         <div className="mb-4 bg-purple-50 p-3 rounded-lg text-purple-800 text-sm font-medium border border-purple-100">
                            {post.hook}
                         </div>
                      )}

                      <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                         {post.caption}
                      </div>

                      {post.hashtags && (
                         <div className="mt-5 flex flex-wrap gap-2">
                             {(typeof post.hashtags === 'string' ? post.hashtags.split(' ') : post.hashtags).map((tag: string, i: number) => (
                                 <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                     {tag.startsWith('#') ? tag : `#${tag}`}
                                 </span>
                             ))}
                         </div>
                      )}

                      {/* POST BUTTON */}
                      <button 
                        onClick={() => handleInstagramPost(postText)}
                        className="mt-6 w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-95 shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Instagram className="w-4 h-4" /> Post to Instagram
                      </button>

                   </div>
                   <CopyBtn text={postText} id={`insta-${idx}`} />
                </div>
             )})}
          </div>
        );

      case 'whatsapp':
        const messages = Array.isArray(data.messages) ? data.messages : (data.variants || []);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {messages.map((msg: any, idx: number) => {
               const content = typeof msg === 'string' ? msg : msg.text || msg.content;
               return (
                <div key={idx} className="bg-[#DCF8C6] bg-opacity-30 border border-green-200 p-5 rounded-2xl rounded-tl-none relative shadow-sm flex flex-col h-full">
                   <div className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed flex-1 mb-4">{content}</div>
                   <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Variant {idx + 1}</span>
                         <div className="flex items-center gap-3">
                            <button onClick={() => handleShare(content)} className="text-slate-400 hover:text-green-600"><Share2 className="w-4 h-4" /></button>
                            <button 
                              onClick={() => handleCopy(content, `wa-${idx}`)}
                              className="text-xs font-semibold text-green-700 hover:underline flex items-center"
                            >
                               {copiedIndex === `wa-${idx}` ? 'Copied' : 'Copy'}
                            </button>
                         </div>
                      </div>
                      
                      {/* SEND BUTTON */}
                      <button 
                        onClick={() => handleWhatsAppShare(content)}
                        className="w-full py-2.5 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20b858] shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Send on WhatsApp
                      </button>
                   </div>
                </div>
               );
             })}
          </div>
        );

      case 'reels':
        const scripts = Array.isArray(data.scripts) ? data.scripts : [data];
        return (
          <div className="space-y-8">
             {scripts.map((script: any, idx: number) => (
               <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-900 text-white p-5 flex items-center gap-3">
                     <div className="p-2 bg-white/10 rounded-lg">
                        <Film className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold">{script.title || `Reel Script ${idx + 1}`}</h4>
                        <div className="text-xs text-slate-400">Duration: {script.duration || '30s'}</div>
                     </div>
                     <button onClick={() => handleShare(JSON.stringify(script))} className="md:hidden p-2 text-white/70 hover:text-white"><Share2 className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-6">
                     {script.hook && (
                        <div className="mb-6">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">The Hook</span>
                           <div className="text-xl font-heading font-bold text-slate-800">“{script.hook}”</div>
                        </div>
                     )}

                     <div className="space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Script Breakdown</span>
                        {script.scenes ? (
                          script.scenes.map((scene: any, sIdx: number) => (
                             <div key={sIdx} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-16 pt-1">
                                   <div className="text-xs font-mono font-bold text-slate-400">{scene.time || `00:${sIdx*5}`}</div>
                                </div>
                                <div className="flex-1 space-y-1">
                                   <div className="text-sm font-semibold text-slate-800">🎥 Visual: {scene.visual}</div>
                                   <div className="text-sm text-slate-600 italic">🗣 Audio: "{scene.audio || scene.voiceover}"</div>
                                </div>
                             </div>
                          ))
                        ) : (
                          <div className="whitespace-pre-wrap text-sm text-slate-700">{script.script || script.content}</div>
                        )}
                     </div>

                     {script.cta && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Call to Action</span>
                           <div className="text-blue-600 font-medium">{script.cta}</div>
                        </div>
                     )}
                     
                     <div className="mt-6">
                         <button 
                            onClick={() => handleInstagramPost(`Hook: ${script.hook}\n\nScript:\n${script.script || JSON.stringify(script.scenes)}\n\nCTA: ${script.cta}`)}
                            className="w-full py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Instagram className="w-4 h-4" /> Copy & Open Instagram
                        </button>
                     </div>

                  </div>
                  <div className="bg-slate-50 p-3 border-t border-slate-100 text-right">
                      <button onClick={() => handleCopy(JSON.stringify(script, null, 2), `reel-${idx}`)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Copy JSON</button>
                  </div>
               </div>
             ))}
          </div>
        );

      case 'festival':
          return (
            <div className="space-y-6">
                {/* Main Post */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 w-full"></div>
                    <div className="p-6">
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Social Media Caption</span>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{data.caption}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button 
                                onClick={() => handleInstagramPost(data.caption)}
                                className="py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-95 text-xs flex items-center justify-center gap-1.5"
                            >
                                <Instagram className="w-3.5 h-3.5" /> Post
                            </button>
                            <button 
                                onClick={() => handleWhatsAppShare(data.caption)}
                                className="py-2.5 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20b858] text-xs flex items-center justify-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" /> Send
                            </button>
                        </div>
                    </div>
                    <CopyBtn text={data.caption} id="fest-cap" />
                </div>

                {/* Wishes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.wishes || []).map((wish: string, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 relative shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">WhatsApp Wish {idx+1}</span>
                            <p className="text-sm text-slate-700 flex-1 mb-4">{wish}</p>
                            <button 
                                onClick={() => handleWhatsAppShare(wish)}
                                className="mt-auto w-full py-2 rounded-lg font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-xs flex items-center justify-center gap-1"
                            >
                                <Send className="w-3 h-3" /> Send
                            </button>
                            <CopyBtn text={wish} id={`fest-wish-${idx}`} />
                        </div>
                    ))}
                </div>

                {/* Poster Copy */}
                {data.poster_headline && (
                   <div className="bg-slate-900 text-white rounded-2xl p-8 text-center relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                       <div className="relative z-10">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Poster Headline Idea</span>
                          <h2 className="text-2xl font-heading font-bold mb-2 text-yellow-400">{data.poster_headline}</h2>
                          {data.poster_subheadline && <p className="text-slate-300 mb-6">{data.poster_subheadline}</p>}
                          <button onClick={handleCreateImage} className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm">Design This</button>
                       </div>
                   </div>
                )}
            </div>
          );

      case 'calendar':
          return (
             <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-slate-800">30-Day Marketing Plan</h3>
                     <button className="flex items-center gap-2 text-sm text-[#6E27FF] font-medium bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                     </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(data.calendar || []).map((day: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500">Day {day.day}</span>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{day.platform || "Social"}</span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-sm mb-2">{day.topic || day.title}</h5>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{day.description || day.content}</p>
                        </div>
                    ))}
                 </div>
             </div>
          );

      case 'gmb':
          return (
             <div className="space-y-8">
                 {/* Business Desc */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><MapPin className="w-5 h-5"/></div>
                        <h4 className="font-bold text-slate-800">Business Description</h4>
                     </div>
                     <p className="text-slate-600 text-sm leading-relaxed">{data.business_description}</p>
                     <CopyBtn text={data.business_description} id="gmb-desc" />
                 </div>
                 
                 {/* FAQs */}
                 <div className="grid grid-cols-1 gap-4">
                     <h4 className="font-bold text-slate-800">Suggested FAQs</h4>
                     {data.faqs?.map((faq: any, i: number) => (
                         <div key={i} className="bg-white p-5 rounded-xl border border-slate-200">
                             <p className="font-bold text-slate-800 text-sm mb-2">Q: {faq.question}</p>
                             <p className="text-slate-600 text-sm">A: {faq.answer}</p>
                         </div>
                     ))}
                 </div>
             </div>
          );

      default:
        return (
             <div className="bg-white p-6 rounded-2xl border border-slate-200 overflow-auto">
                <pre className="text-xs text-slate-600">{JSON.stringify(data, null, 2)}</pre>
             </div>
        );
    }
  };

  return (
    <div className="mt-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-heading font-bold text-slate-900">Your Generated Content</h2>
        
        <div className="flex flex-wrap items-center gap-3">
             {/* Action Buttons Group */}
             <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                
                {/* 1. Share Button */}
                <button 
                  onClick={() => handleShare()}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6E27FF] hover:bg-slate-50 px-3 py-1.5 rounded-md transition-all"
                  title="Share to Apps"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                
                <div className="w-px h-4 bg-slate-200"></div>

                {/* 2. Copy All Button */}
                <button 
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6E27FF] hover:bg-slate-50 px-3 py-1.5 rounded-md transition-all"
                    title="Copy all results"
                >
                    {isCopyingAll ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardList className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCopyingAll ? 'Copied' : 'Copy All'}</span>
                </button>
             </div>

             {/* 3. Image Generation Button (Only for visual features) */}
             {(feature === 'instagram' || feature === 'reels' || feature === 'festival' || feature === 'poster') && (
                <>
                   <button 
                      onClick={handleCreateImage}
                      disabled={isGeneratingImage}
                      className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                   >
                      {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      {isGeneratingImage ? 'Designing...' : 'Create Design'}
                   </button>
                   
                   {generatedImage && (
                       <a 
                          href={generatedImage} 
                          download={`unlockify-${feature}-${Date.now()}.png`} 
                          className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                          title="Download Image"
                       >
                           <Download className="w-4 h-4" />
                           <span className="hidden sm:inline">Download</span>
                       </a>
                   )}
                </>
             )}

             {/* 4. Regenerate */}
             <button 
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6E27FF] bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
             >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} /> 
             </button>
        </div>
      </div>
      
      {/* Generated Image Section */}
      {isGeneratingImage && (
        <div className="mb-6 bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center animate-fade-in text-center">
            <Loader2 className="w-8 h-8 text-[#6E27FF] animate-spin mb-3" />
            <h4 className="font-bold text-slate-700">AI is designing your visual...</h4>
            {formData?.logo && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3"/> Adding your logo...</p>}
            <p className="text-slate-500 text-sm mt-1">Detecting size: {feature === 'reels' ? '9:16 (Story/Reel)' : '1:1 (Post)'}</p>
        </div>
      )}

      {generatedImage && (
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-3 border-b border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-bold text-pink-900">AI Generated Design</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleInstagramPost(feature === 'festival' ? data.caption : (data.posts?.[0]?.caption || ''))}
                        className="text-xs font-bold bg-white text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center gap-1"
                    >
                        <Instagram className="w-3 h-3" /> Post Image
                    </button>
                    <a href={generatedImage} download="unlockify-design.png" className="text-xs font-bold bg-white text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download
                    </a>
                </div>
            </div>
            <div className="p-4 flex justify-center bg-slate-100/50">
                <img src={generatedImage} alt="AI Generated Marketing" className="max-h-[400px] rounded-lg shadow-md" />
            </div>
        </div>
      )}

      {renderContent()}

      <div className="flex flex-col gap-3 mt-6 md:hidden">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6E27FF] bg-white border border-slate-200 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all w-full justify-center"
          >
            <Share2 className="w-4 h-4" /> Share to Apps
          </button>
          
          <button 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6E27FF] bg-white border border-slate-200 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all w-full justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} /> 
            {isRegenerating ? 'Generating New Version...' : 'Regenerate This Content'}
          </button>
      </div>

      {result.upgrade_note && (
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
               <h4 className="font-bold text-amber-900 text-sm">Want Better Results?</h4>
               <p className="text-amber-800 text-xs mt-0.5">{result.upgrade_note}</p>
            </div>
            <button className="text-xs font-bold bg-white text-amber-600 px-4 py-2 rounded-lg shadow-sm border border-amber-100 whitespace-nowrap">
                Upgrade Plan
            </button>
        </div>
      )}
    </div>
  );
};

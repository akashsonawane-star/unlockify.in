import React, { useState, useEffect, useRef } from 'react';
import { AIResponseData, FeatureType, FormData } from '../types';
import { Copy, AlertCircle, Check, Film, MapPin, Download, RefreshCw, ClipboardList, Share2, Image as ImageIcon, Loader2, Instagram, MessageCircle, Send, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Wand2, Tv, Mic, Clapperboard, Type, Play, Volume2, Video } from 'lucide-react';
import { generateMarketingImage, generateContent, generateReelVideo, generateReelAudio } from '../services/geminiService';

interface ResultDisplayProps {
  result: AIResponseData;
  feature: FeatureType;
  onRegenerate: () => void;
  isRegenerating: boolean;
  formData: FormData | null;
}

type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, feature, onRegenerate, isRegenerating, formData }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isCopyingAll, setIsCopyingAll] = useState(false);
  
  // Local result state for remixes (e.g. Reels variations)
  const [displayResult, setDisplayResult] = useState<AIResponseData>(result);
  const [isRemixing, setIsRemixing] = useState(false);

  // Video Generation State
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setDisplayResult(result);
  }, [result]);
  
  // Image Generation State
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-left');

  // Effect to re-apply logo when position changes
  useEffect(() => {
    if (rawImage && formData?.logo) {
       addLogoToImage(rawImage, formData.logo, logoPosition).then(setDisplayedImage);
    } else if (rawImage) {
       setDisplayedImage(rawImage);
    }
  }, [rawImage, logoPosition, formData?.logo]);

  if (displayResult.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-red-700">{displayResult.code || "Generation Failed"}</h3>
        <p className="text-red-600 mt-1">{displayResult.message}</p>
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

  const { data } = displayResult;

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

  const handleRemixReel = async (style: 'Animation' | 'Advertising') => {
    if (!formData) return;
    setIsRemixing(true);
    try {
        const newFormData = { ...formData, duration: '15s' as const };
        
        if (style === 'Animation') {
            newFormData.tone = 'Fun';
            newFormData.visualStyle = '3D Animation';
            // Append instruction to context to guide the model
            newFormData.offerDetails = `${formData.offerDetails}. Create a fun, animated/cartoon style script description.`;
        } else {
            newFormData.tone = 'Urgent';
            newFormData.visualStyle = 'Cinematic Live Action';
            newFormData.offerDetails = `${formData.offerDetails}. Create a high-energy, fast-paced advertising commercial style script.`;
        }
        
        const response = await generateContent('reels', newFormData, result.user_plan);
        if (response.success) {
            setDisplayResult(response);
        } else {
            alert(response.message || "Could not generate remix.");
        }
    } catch (e) {
        console.error(e);
        alert("Something went wrong while remixing.");
    } finally {
        setIsRemixing(false);
    }
  };

  const handleGenerateFullVideo = async (script: any) => {
    setIsGeneratingVideo(true);
    setGeneratedVideo(null);
    setGeneratedAudio(null);

    // 1. Prepare Prompts
    const visualScenes = script.scenes ? script.scenes.map((s:any) => s.visual).join('. ') : script.script;
    const textOverlays = script.scenes ? script.scenes.map((s:any) => s.text_overlay).join('. ') : '';
    
    const visualPrompt = `Vertical video 9:16 aspect ratio. ${script.visual_style || 'Cinematic'} style. ${visualScenes}. Text overlays visible: ${textOverlays}. High quality, advertising standard, 4k.`;
    
    const audioText = script.scenes ? script.scenes.map((s:any) => s.audio || s.voiceover).join(' ') : script.script;
    const voiceGender = script.voice_gender || 'Female';

    try {
        // 2. Call APIs in parallel
        // We handle Veo key selection inside the service, but if they run in parallel, multiple popups might conflict.
        // Let's run sequence for better UX flow regarding keys.
        
        const videoUrl = await generateReelVideo(visualPrompt);
        if (!videoUrl) throw new Error("Video generation failed or cancelled");
        
        const audioUrl = await generateReelAudio(audioText, voiceGender === 'Male' ? 'Male' : 'Female');

        setGeneratedVideo(videoUrl);
        setGeneratedAudio(audioUrl);
    } catch (e) {
        console.error(e);
        alert("Failed to generate video assets. Please try again.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handlePlayPreview = () => {
      if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
      }
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
      }
  };

  const getCopyAllText = () => {
    if (!data) return "";
    let textToCopy = "";

    // Helper to safely extract arrays
    const getArray = (src: any, keys: string[]) => {
       for(const k of keys) if(Array.isArray(src[k])) return src[k];
       if(Array.isArray(src)) return src;
       return [];
    };

    if (feature === 'instagram') {
      const posts = getArray(data, ['posts', 'options', 'captions']);
      if (posts.length > 0) {
        textToCopy = posts.map((p: any, i: number) => 
          `Option ${i + 1}:\n${p.hook ? `Hook: ${p.hook}\n` : ''}${p.caption || p.text || p.content}\n${Array.isArray(p.hashtags) ? p.hashtags.join(' ') : (p.hashtags || '')}`
        ).join('\n\n---\n\n');
      } else if (data.caption || data.content) {
        textToCopy = `${data.hook ? `Hook: ${data.hook}\n` : ''}${data.caption || data.content}\n${Array.isArray(data.hashtags) ? data.hashtags.join(' ') : (data.hashtags || '')}`;
      }
    } 
    else if (feature === 'whatsapp') {
      const messages = getArray(data, ['messages', 'variants', 'options']);
      if (messages.length > 0) {
        textToCopy = messages.map((m: any, i: number) => {
           const content = typeof m === 'string' ? m : m.text || m.content || m.message;
           return `Variant ${i + 1}:\n${content}`;
        }).join('\n\n---\n\n');
      } else if (data.message || data.text || data.content) {
          textToCopy = data.message || data.text || data.content;
      }
    }
    else if (feature === 'reels') {
      const scripts = getArray(data, ['scripts', 'options']);
      const list = scripts.length > 0 ? scripts : [data];
      
      textToCopy = list.map((s: any, i: number) => {
        let scriptContent = "";
        if (s.scenes) {
            scriptContent = s.scenes.map((scene: any) => `[${scene.time}]\nVisual: ${scene.visual}\nText Overlay: ${scene.text_overlay || 'None'}\nAudio: ${scene.audio}`).join('\n\n');
        } else {
            scriptContent = s.script || s.content;
        }
        return `Script ${i + 1}: ${s.title || ''}\nStyle: ${s.visual_style || 'Cinematic'}\nVoice: ${s.voice_gender || 'Voiceover'}\nHook: ${s.hook || ''}\n\n${scriptContent}\n\nCTA: ${s.cta || ''}`;
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

  const addLogoToImage = (bgUrl: string, logoUrl: string, position: LogoPosition): Promise<string> => {
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
          // Logo size: 12% of width (Increased slightly for better visibility)
          const logoWidth = bg.width * 0.12;
          const scale = logoWidth / logo.width;
          const logoHeight = logo.height * scale;
          
          // Position calculation
          const padding = bg.width * 0.05; // 5% padding
          let x = padding;
          let y = padding;

          switch (position) {
            case 'top-left':
                x = padding;
                y = padding;
                break;
            case 'top-right':
                x = bg.width - logoWidth - padding;
                y = padding;
                break;
            case 'bottom-left':
                x = padding;
                y = bg.height - logoHeight - padding;
                break;
            case 'bottom-right':
                x = bg.width - logoWidth - padding;
                y = bg.height - logoHeight - padding;
                break;
          }
          
          if (ctx) {
            // Add drop shadow to make logo pop on any background
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            
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
    setRawImage(null);
    setDisplayedImage(null);

    try {
      // 1. Determine Aspect Ratio based on feature
      // Reels/Festival = 9:16 (Portrait), Instagram/Poster = 1:1 (Square)
      const ratio = (feature === 'reels' || feature === 'festival') ? '9:16' : '1:1';

      // 2. Build a prompt based on the generated data AND user inputs
      let imagePrompt = "";
      const bizName = formData?.businessName || "Brand";
      const bizType = formData?.businessType || "Business";
      const topic = formData?.offerDetails || formData?.festivalName || "Special Offer";
      const tone = formData?.tone || "Professional";

      // Extract key details safely based on feature type
      if (feature === 'festival') {
         const headline = data.poster_headline || topic;
         imagePrompt = `A festival poster for ${headline}. Context: ${bizType} named ${bizName}. Style: ${tone}, vibrant, celebratory, high quality graphic design, minimal text.`;
      } else if (feature === 'instagram') {
         // Use User Input for context rather than generated caption to ensure relevance
         imagePrompt = `A high-quality professional Instagram photo for a ${bizType} named ${bizName}. Topic: ${topic}. Style: ${tone}, aesthetic, photorealistic, premium look, clear focal point.`;
      } else if (feature === 'reels') {
         const hook = data.scripts?.[0]?.hook || topic;
         imagePrompt = `A cinematic vertical background image for a reel about ${topic}. Theme: ${hook}. Style: ${tone}, engaging, high resolution, suitable for video background, abstract or scenic.`;
      } else if (feature === 'poster') {
         const headline = data.poster_headline || topic;
         imagePrompt = `A professional advertising poster for ${bizType} named ${bizName}. Headline theme: ${headline}. Style: ${tone}, eye-catching, marketing focused, clean composition.`;
      } else {
         imagePrompt = `A professional marketing image for a ${bizType} named ${bizName} about ${topic}. Modern, clean design.`;
      }

      // Add randomness to prompt to ensure variation on regeneration
      const styles = ["clean", "minimal", "vibrant", "dramatic lighting", "soft focus", "bold colors"];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      imagePrompt += ` Variation: ${randomStyle}.`;

      // 3. Call Service
      let imageUrl = await generateMarketingImage(imagePrompt, ratio);
      
      if (!imageUrl) {
          throw new Error("Image generation failed");
      }

      // Save raw image
      setRawImage(imageUrl);
      
      // If no logo, raw is displayed. If logo exists, Effect will handle composition.
      if (!formData?.logo) {
         setDisplayedImage(imageUrl);
      }

    } catch (err) {
      console.error(err);
      alert("Sorry, we couldn't generate the image at this moment. Please try again later.");
    } finally {
      setIsGeneratingImage(false);
    }
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
        // Robust Extraction for Instagram
        let posts: any[] = [];
        // Check varied potential keys
        if (data.posts && Array.isArray(data.posts)) posts = data.posts;
        else if (data.options && Array.isArray(data.options)) posts = data.options;
        else if (data.captions && Array.isArray(data.captions)) posts = data.captions;
        else if (Array.isArray(data)) posts = data;
        else if (data.caption || data.content) posts = [data];

        if (posts.length === 0) {
            return (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <p>Content generated, but format was unexpected. Please try regenerating.</p>
                  <pre className="text-xs text-left mt-4 bg-slate-50 p-2 overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
              </div>
            );
        }

        return (
          <div className="space-y-6">
             {posts.map((post: any, idx: number) => {
                const captionText = post.caption || post.text || post.content || "";
                const hashtagsText = Array.isArray(post.hashtags) ? post.hashtags.join(' ') : (post.hashtags || "");
                const postText = `${post.hook ? post.hook + '\n\n' : ''}${captionText}\n\n${hashtagsText}`;
                
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
                         {captionText}
                      </div>

                      {hashtagsText && (
                         <div className="mt-5 flex flex-wrap gap-2">
                             {hashtagsText.split(' ').map((tag: string, i: number) => (
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
        // Robust Extraction for WhatsApp
        let messages: any[] = [];
        if (data.messages && Array.isArray(data.messages)) messages = data.messages;
        else if (data.variants && Array.isArray(data.variants)) messages = data.variants;
        else if (data.options && Array.isArray(data.options)) messages = data.options;
        else if (Array.isArray(data)) messages = data;
        else if (data.message || data.text || data.content) messages = [data];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {messages.map((msg: any, idx: number) => {
               const content = typeof msg === 'string' ? msg : msg.text || msg.content || msg.message || "";
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
        let scripts: any[] = [];
        if (data.scripts && Array.isArray(data.scripts)) scripts = data.scripts;
        else if (data.options && Array.isArray(data.options)) scripts = data.options;
        else if (Array.isArray(data)) scripts = data;
        else if (data.script || data.content || data.scenes) scripts = [data];

        return (
          <div className="space-y-6">
            {/* New Remix Section */}
             {formData && (
                 <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-white p-2.5 rounded-xl text-purple-600 shadow-sm ring-1 ring-purple-100">
                          <Wand2 className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-sm">Remix to 15s Reel</h4>
                          <p className="text-slate-500 text-xs mt-0.5">Generate a quick variation:</p>
                       </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <button 
                          onClick={() => handleRemixReel('Animation')}
                          disabled={isRemixing}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                       >
                          {isRemixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                          Animation Style
                       </button>
                       <button 
                          onClick={() => handleRemixReel('Advertising')}
                          disabled={isRemixing}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                       >
                          {isRemixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tv className="w-3.5 h-3.5" />}
                          Ad Commercial
                       </button>
                    </div>
                 </div>
             )}

             {/* Generated Video Player Section */}
             {(generatedVideo || isGeneratingVideo) && (
               <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800 animate-fade-in-up">
                 <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="text-white font-bold flex items-center gap-2"><Video className="w-5 h-5 text-purple-500" /> AI Video Preview</h4>
                    {generatedVideo && (
                       <div className="flex gap-2">
                           <a href={generatedVideo} download className="text-xs font-bold bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                               <Download className="w-3 h-3" /> Video
                           </a>
                           {generatedAudio && (
                               <a href={generatedAudio} download className="text-xs font-bold bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                   <Download className="w-3 h-3" /> Audio
                               </a>
                           )}
                       </div>
                    )}
                 </div>
                 <div className="relative aspect-[9/16] max-h-[500px] bg-slate-900 flex items-center justify-center mx-auto">
                    {isGeneratingVideo ? (
                       <div className="text-center p-8">
                           <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
                           <p className="text-white font-bold">Generating Video & Audio...</p>
                           <p className="text-slate-400 text-xs mt-2">This may take up to a minute.</p>
                       </div>
                    ) : (
                       <>
                           {generatedVideo && (
                               <video 
                                 ref={videoRef}
                                 src={generatedVideo} 
                                 className="w-full h-full object-cover" 
                                 controls={false}
                                 loop 
                                 playsInline
                               />
                           )}
                           {/* Overlay Text Placeholder (simulating text animation) */}
                           <div className="absolute bottom-10 left-0 w-full text-center px-4 pointer-events-none">
                              <p className="text-white font-bold text-shadow-lg animate-pulse bg-black/30 backdrop-blur-sm inline-block px-2 rounded">
                                 {data.scripts?.[0]?.scenes?.[0]?.text_overlay || "AI Generated Video"}
                              </p>
                           </div>
                       </>
                    )}
                 </div>
                 
                 {/* Controls */}
                 {generatedVideo && (
                    <div className="bg-slate-900 p-4 border-t border-slate-800 flex items-center gap-4">
                        <button 
                            onClick={handlePlayPreview}
                            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors"
                        >
                            <Play className="w-5 h-5 fill-current" />
                        </button>
                        <div className="flex-1">
                            {generatedAudio && (
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-slate-400" />
                                    <audio ref={audioRef} src={generatedAudio} controls className="h-8 w-full max-w-[200px]" />
                                </div>
                            )}
                        </div>
                    </div>
                 )}
               </div>
             )}

             {scripts.map((script: any, idx: number) => (
               <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center gap-4">
                     <div className="p-2 bg-white/10 rounded-lg">
                        <Film className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-[200px]">
                        <h4 className="font-bold text-lg">{script.title || `Reel Script ${idx + 1}`}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                           <span>{script.duration || '30s'}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Clapperboard className="w-3 h-3"/> {script.visual_style || 'Cinematic'}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Mic className="w-3 h-3"/> {script.voice_gender || 'Voiceover'}</span>
                        </div>
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
                          <div className="space-y-4">
                            {script.scenes.map((scene: any, sIdx: number) => (
                               <div key={sIdx} className="grid grid-cols-12 gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                  {/* Time Column */}
                                  <div className="col-span-12 md:col-span-2 flex flex-row md:flex-col gap-2 items-center md:items-start">
                                     <div className="px-2 py-1 bg-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">{scene.time || `00:${sIdx*5}`}</div>
                                  </div>
                                  
                                  {/* Visual & Text Column */}
                                  <div className="col-span-12 md:col-span-5 space-y-3">
                                     <div className="text-sm font-semibold text-slate-800 flex gap-2">
                                        <div className="mt-0.5"><Film className="w-3.5 h-3.5 text-blue-500" /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-blue-600 mb-0.5">VISUAL</span>
                                            {scene.visual}
                                        </div>
                                     </div>
                                     {scene.text_overlay && (
                                        <div className="text-sm font-medium text-slate-800 flex gap-2 pl-1 border-l-2 border-purple-200">
                                            <div className="mt-0.5"><Type className="w-3.5 h-3.5 text-purple-500" /></div>
                                            <div>
                                                <span className="block text-xs font-bold text-purple-600 mb-0.5">TEXT OVERLAY</span>
                                                "{scene.text_overlay}"
                                            </div>
                                        </div>
                                     )}
                                  </div>

                                  {/* Audio Column */}
                                  <div className="col-span-12 md:col-span-5">
                                      <div className="text-sm text-slate-600 italic flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 h-full">
                                         <div className="mt-0.5"><Mic className="w-3.5 h-3.5 text-slate-400" /></div>
                                         <div>
                                            <span className="block text-xs font-bold text-slate-400 mb-0.5 not-italic uppercase">Audio / Voiceover</span>
                                            "{scene.audio || scene.voiceover}"
                                         </div>
                                      </div>
                                  </div>
                               </div>
                            ))}
                          </div>
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
                     
                     <div className="mt-6 flex flex-col md:flex-row gap-4">
                         {/* Generate Video Button */}
                         <button 
                            onClick={() => handleGenerateFullVideo(script)}
                            disabled={isGeneratingVideo}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                        >
                            {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                            {isGeneratingVideo ? 'Creating Video...' : 'Generate Video Reel'}
                        </button>

                         <button 
                            onClick={() => handleInstagramPost(`Hook: ${script.hook}\n\nScript:\n${script.script || JSON.stringify(script.scenes)}\n\nCTA: ${script.cta}`)}
                            className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
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
                      {isGeneratingImage ? 'Designing...' : (displayedImage ? 'New Design' : 'Create Design')}
                   </button>
                   
                   {displayedImage && (
                       <a 
                          href={displayedImage} 
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

      {displayedImage && (
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-3 border-b border-pink-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-bold text-pink-900">AI Generated Design</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Regenerate Button */}
                    <button 
                        onClick={handleCreateImage}
                        disabled={isGeneratingImage}
                        className="text-xs font-bold bg-white text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                        Change Design
                    </button>

                    <button 
                        onClick={() => handleInstagramPost(feature === 'festival' ? data.caption : (data.posts?.[0]?.caption || ''))}
                        className="text-xs font-bold bg-white text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center gap-1"
                    >
                        <Instagram className="w-3 h-3" /> Post
                    </button>
                    <a href={displayedImage} download="unlockify-design.png" className="text-xs font-bold bg-white text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download
                    </a>
                </div>
            </div>
            
            <div className="p-4 flex justify-center bg-slate-100/50 relative">
                <div className="relative group inline-block">
                    <img src={displayedImage} alt="AI Generated Marketing" className="max-h-[400px] rounded-lg shadow-md" />
                    
                    {/* Logo Positioning Controls - Only show if logo exists */}
                    {formData?.logo && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             {/* Top Left */}
                             <button 
                               onClick={() => setLogoPosition('top-left')}
                               className={`absolute top-2 left-2 p-1.5 rounded-full shadow-sm backdrop-blur-sm border transition-all ${logoPosition === 'top-left' ? 'bg-white text-purple-600 border-purple-200 scale-110' : 'bg-white/50 text-slate-600 border-white/50 hover:bg-white hover:scale-110'}`}
                               title="Move Logo Top-Left"
                             >
                                <ArrowUpLeft className="w-4 h-4" />
                             </button>
                             {/* Top Right */}
                             <button 
                               onClick={() => setLogoPosition('top-right')}
                               className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm backdrop-blur-sm border transition-all ${logoPosition === 'top-right' ? 'bg-white text-purple-600 border-purple-200 scale-110' : 'bg-white/50 text-slate-600 border-white/50 hover:bg-white hover:scale-110'}`}
                               title="Move Logo Top-Right"
                             >
                                <ArrowUpRight className="w-4 h-4" />
                             </button>
                             {/* Bottom Left */}
                             <button 
                               onClick={() => setLogoPosition('bottom-left')}
                               className={`absolute bottom-2 left-2 p-1.5 rounded-full shadow-sm backdrop-blur-sm border transition-all ${logoPosition === 'bottom-left' ? 'bg-white text-purple-600 border-purple-200 scale-110' : 'bg-white/50 text-slate-600 border-white/50 hover:bg-white hover:scale-110'}`}
                               title="Move Logo Bottom-Left"
                             >
                                <ArrowDownLeft className="w-4 h-4" />
                             </button>
                             {/* Bottom Right */}
                             <button 
                               onClick={() => setLogoPosition('bottom-right')}
                               className={`absolute bottom-2 right-2 p-1.5 rounded-full shadow-sm backdrop-blur-sm border transition-all ${logoPosition === 'bottom-right' ? 'bg-white text-purple-600 border-purple-200 scale-110' : 'bg-white/50 text-slate-600 border-white/50 hover:bg-white hover:scale-110'}`}
                               title="Move Logo Bottom-Right"
                             >
                                <ArrowDownRight className="w-4 h-4" />
                             </button>
                             
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity delay-150 font-medium">
                                Adjust Logo Position
                             </div>
                        </div>
                    )}
                </div>
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
import React, { useState, useEffect, useRef } from 'react';
import { AIResponseData, FeatureType, FormData } from '../types';
import { 
  Copy, AlertCircle, Check, Film, MapPin, Download, RefreshCw, 
  Image as ImageIcon, Loader2, Instagram, MessageCircle, 
  Video, Sparkles, Star, MoreVertical, ThumbsUp, Share2, Phone, 
  Globe, Navigation, Play, Info
} from 'lucide-react';
import { generateMarketingImage, generateReelVideo, generateReelAudio } from '../services/geminiService';

// Utility functions for decoding raw PCM from Gemini TTS
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  const [displayResult, setDisplayResult] = useState<AIResponseData>(result);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-left');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Video/Audio Generation State
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [rawAudioData, setRawAudioData] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const supportsVisual = ['instagram', 'festival', 'poster', 'reels', 'gmb', 'whatsapp'].includes(feature);

  useEffect(() => {
    setDisplayResult(result);
    setRawImage(null);
    setDisplayedImage(null);
    setGeneratedVideo(null);
    
    if (result.success && !result.error && ['festival', 'poster', 'instagram', 'reels', 'gmb'].includes(feature)) {
        handleCreateImage();
    }
  }, [result, feature]);

  useEffect(() => {
    if (rawImage && formData?.logo) {
       addLogoToImage(rawImage, formData.logo, logoPosition).then(setDisplayedImage);
    } else if (rawImage) {
       setDisplayedImage(rawImage);
    }
  }, [rawImage, logoPosition, formData?.logo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async (quality: 'standard' | '4k') => {
    if (!displayedImage) return;
    let downloadUrl = displayedImage;
    if (quality === 'standard') {
        const img = new Image();
        img.src = displayedImage;
        await new Promise(resolve => img.onload = resolve);
        const canvas = document.createElement('canvas');
        const maxDim = 1080;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
        else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        downloadUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Unlockify_${feature}_${quality}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowQualityMenu(false);
  };

  const handleCreateImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const ratio = (feature === 'reels' || feature === 'festival') ? '9:16' : '1:1';
      const bizName = formData?.businessName || "Brand";
      const topic = formData?.offerDetails || formData?.festivalName || "Special Offer";
      let imagePrompt = `Professional high-end advertisement visual for ${bizName}. Focus: ${topic}. Clean commercial background, realistic textures, cinematic 4k lighting. No text.`;
      let imageUrl = await generateMarketingImage(imagePrompt, ratio);
      if (imageUrl) setRawImage(imageUrl);
    } catch (err) {
      console.error("AI Image Generation failed:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const addLogoToImage = (bgUrl: string, logoUrl: string, position: LogoPosition): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const bg = new Image();
      const logo = new Image();
      bg.onload = () => {
        canvas.width = bg.width;
        canvas.height = bg.height;
        ctx?.drawImage(bg, 0, 0);
        logo.onload = () => {
          const logoWidth = bg.width * 0.15;
          const scale = logoWidth / logo.width;
          const logoHeight = logo.height * scale;
          const padding = bg.width * 0.05;
          let x = padding, y = padding;
          if (position === 'top-right') x = bg.width - logoWidth - padding;
          else if (position === 'bottom-left') y = bg.height - logoHeight - padding;
          else if (position === 'bottom-right') { x = bg.width - logoWidth - padding; y = bg.height - logoHeight - padding; }
          ctx?.drawImage(logo, x, y, logoWidth, logoHeight);
          resolve(canvas.toDataURL('image/jpeg', 1.0));
        };
        logo.src = logoUrl;
      };
      bg.src = bgUrl;
    });
  };

  const handleGenerateFullVideo = async (script: any) => {
    setIsGeneratingVideo(true);
    setGeneratedVideo(null);
    setRawAudioData(null);
    const visualScenes = script.scenes ? script.scenes.map((s:any) => s.visual).join('. ') : script.script;
    const visualPrompt = `Vertical video 9:16 aspect ratio. ${script.visual_style || 'Cinematic'} style. ${visualScenes}. High quality 4k.`;
    const audioText = script.scenes ? script.scenes.map((s:any) => s.audio || s.voiceover).join(' ') : script.script;
    const voiceGender = script.voice_gender || 'Female';
    try {
        const videoUrl = await generateReelVideo(visualPrompt);
        if (!videoUrl) throw new Error("Video generation failed");
        const audioBase64 = await generateReelAudio(audioText, voiceGender === 'Male' ? 'Male' : 'Female');
        setGeneratedVideo(videoUrl);
        setRawAudioData(audioBase64); 
    } catch (e) {
        console.error(e);
        alert("Failed to generate assets. Check your connection.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handlePlayPreview = async () => {
      if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
      }
      if (rawAudioData) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          const ctx = audioContextRef.current;
          const audioPart = rawAudioData.includes(',') ? rawAudioData.split(',')[1] : rawAudioData;
          const bytes = decodeBase64(audioPart);
          const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
      }
  };

  const renderMockup = () => {
    const { data } = displayResult;
    const bizName = formData?.businessName || "Your Business";
    const city = formData?.city || "Mumbai";

    if (displayedImage) {
      return (
        <div className="relative w-full h-full animate-fade-in group">
          <img src={displayedImage} className="w-full h-full object-cover rounded-2xl shadow-inner border border-slate-100" alt="AI Generated Design" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
             <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-xl border border-white">AI-Design Active</span>
          </div>
        </div>
      );
    }

    if (feature === 'gmb') {
      const reviewText = data.reviews?.[0]?.text || data.update || "Professional business update for your GMB profile.";
      return (
        <div className="w-full h-full bg-slate-100 flex flex-col p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">G</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{bizName}</h4>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wide">{city} • Local Review</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                <span className="text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-tighter">Verified Review</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{reviewText}"</p>
              
              <div className="mt-6 flex items-center gap-6 pt-4 border-t border-slate-50 text-slate-400">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><ThumbsUp className="w-3 h-3" /> Helpful</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><Share2 className="w-3 h-3" /> Share</div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 flex gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-2 flex flex-col items-center gap-1 shadow-sm">
                   <Phone className="w-3 h-3 text-blue-600" />
                   <span className="text-[8px] font-bold text-blue-600 uppercase">Call</span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-2 flex flex-col items-center gap-1 shadow-sm">
                   <Navigation className="w-3 h-3 text-blue-600" />
                   <span className="text-[8px] font-bold text-blue-600 uppercase">Route</span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-2 flex flex-col items-center gap-1 shadow-sm">
                   <Globe className="w-3 h-3 text-blue-600" />
                   <span className="text-[8px] font-bold text-blue-600 uppercase">Web</span>
                </div>
            </div>
          </div>
        </div>
      );
    }

    if (feature === 'whatsapp') {
      const msg = data.messages?.[0] || "Hi there!";
      return (
        <div className="w-full h-full bg-[#e5ddd5] flex flex-col animate-fade-in relative overflow-hidden">
           <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-lg relative z-10">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-300 rounded-full flex-shrink-0 flex items-center justify-center text-[#075e54] font-bold">B</div>
                 <div>
                    <h4 className="text-sm font-bold truncate max-w-[120px]">{bizName}</h4>
                    <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold">Online</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 p-4 flex flex-col gap-4">
              <div className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tr-none shadow-md max-w-[90%] text-sm text-slate-800 relative self-end ml-auto border border-green-200">
                  <p className="whitespace-pre-wrap leading-relaxed">{msg}</p>
              </div>
           </div>
        </div>
      );
    }

    return (
      <div className="aspect-[9/16] lg:min-h-[600px] w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-pulse">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-900">Rendering Assets...</p>
      </div>
    );
  };

  const renderContentItems = () => {
    const { data } = displayResult;
    
    if (feature === 'instagram' && data.posts) {
      return data.posts.map((post: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option {i + 1}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(`${post.caption}\n\n${post.hashtags.join(' ')}`, `post-${i}`)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                {copiedIndex === `post-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-sm font-bold text-brand-purple bg-purple-50 px-3 py-2 rounded-lg">Hook: {post.hook}</div>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{post.caption}</div>
        </div>
      ));
    }

    if (feature === 'whatsapp' && data.messages) {
      return data.messages.map((msg: string, i: number) => (
        <div key={i} className="bg-[#E7FCEF] rounded-2xl border border-green-100 p-6 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <button onClick={() => handleCopy(msg, `wa-${i}`)} className="p-2 text-slate-400 hover:text-slate-900">
                {copiedIndex === `wa-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
           </div>
           <div className="text-sm text-slate-800 whitespace-pre-wrap">{msg}</div>
        </div>
      ));
    }

    if (feature === 'reels' && data.scripts) {
        return data.scripts.map((script: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <Film className="w-4 h-4 text-purple-600" />
                    <button 
                        onClick={() => handleGenerateFullVideo(script)}
                        disabled={isGeneratingVideo}
                        className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-2"
                    >
                        {isGeneratingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                        Generate Reel
                    </button>
                </div>
                <div className="space-y-3">
                    {script.scenes?.map((scene: any, sIdx: number) => (
                        <div key={sIdx} className="p-3 bg-slate-50 rounded-xl text-xs">
                            <span className="font-bold text-brand-purple uppercase mr-2">{scene.time}:</span>
                            {scene.visual}
                        </div>
                    ))}
                </div>
            </div>
        ));
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="p-4 bg-slate-50 rounded-xl text-xs font-mono overflow-auto max-h-[400px]">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    );
  };

  if (result.error) {
    return (
        <div className="mt-10 p-10 bg-white rounded-3xl border border-red-100 shadow-xl text-center space-y-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Render Process Interrupted</h3>
            <button onClick={onRegenerate} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">Restart Generation</button>
        </div>
    );
  }

  return (
    <div className="mt-10 space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900">Your Preview Engine</h2>
            <p className="text-sm text-slate-500 font-medium">Ready-to-use marketing for {formData?.businessName || 'your business'}.</p>
        </div>
        <div className="flex gap-3">
            {supportsVisual && (
                <button
                    onClick={handleCreateImage}
                    disabled={isGeneratingImage}
                    className="px-6 py-3 bg-brand-purple text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all hover:bg-purple-700"
                >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isGeneratingImage ? 'Designing...' : 'Remake Design'}
                </button>
            )}
        </div>
      </div>

      {supportsVisual ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative min-h-[450px] flex items-center justify-center">
                    {isGeneratingVideo || isGeneratingImage ? (
                        <div className="aspect-[9/16] lg:min-h-[600px] w-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-purple" />
                            <p className="font-bold text-lg">Polishing Visuals...</p>
                        </div>
                    ) : (
                        <>
                            {generatedVideo ? (
                                <div className="aspect-[9/16] lg:min-h-[600px] relative group w-full">
                                    <video ref={videoRef} src={generatedVideo} className="w-full h-full object-cover rounded-2xl" loop playsInline />
                                    <button onClick={handlePlayPreview} className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors">
                                        <Play className="w-14 h-14 text-white fill-current opacity-80" />
                                    </button>
                                </div>
                            ) : renderMockup()}
                        </>
                    )}

                    {displayedImage && !isGeneratingImage && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between shadow-2xl border border-white/50">
                             <div className="flex gap-1.5">
                                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                                    <button 
                                      key={pos} 
                                      title={`Place logo ${pos}`}
                                      onClick={() => setLogoPosition(pos as LogoPosition)} 
                                      className={`w-6 h-6 rounded border transition-all ${logoPosition === pos ? 'bg-brand-purple border-brand-purple ring-2 ring-purple-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
                                    </button>
                                ))}
                             </div>
                             
                             <div className="relative" ref={qualityMenuRef}>
                               <button 
                                 onClick={() => setShowQualityMenu(!showQualityMenu)} 
                                 className="text-[11px] font-bold bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95"
                               >
                                  <Download className="w-3.5 h-3.5" /> Save Image
                               </button>

                               {showQualityMenu && (
                                 <div className="absolute bottom-full right-0 mb-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden z-[100]">
                                   <button 
                                     onClick={() => handleDownloadImage('standard')}
                                     className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-700 hover:bg-brand-purple hover:text-white transition-colors"
                                   >
                                     Standard (1080p)
                                   </button>
                                   <button 
                                     onClick={() => handleDownloadImage('4k')}
                                     className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-900 hover:bg-brand-purple hover:text-white transition-colors"
                                   >
                                     Ultra High (4K)
                                   </button>
                                 </div>
                               )}
                             </div>
                        </div>
                    )}
                </div>
                <div className="px-3 py-1 flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase italic">
                    <Info className="w-3 h-3" /> 
                    Live design preview. Quality optimized for display.
                </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
                {renderContentItems()}
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
            {renderContentItems()}
        </div>
      )}
    </div>
  );
};
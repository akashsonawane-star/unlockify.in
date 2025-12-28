
import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FormData, UserPlan, FeatureType, AIResponseData } from "../types";

/**
 * Normalizes error messages for Gemini API.
 */
const isNetworkError = (err: any): boolean => {
  const msg = err?.message?.toLowerCase() || "";
  return msg.includes('failed to fetch') || msg.includes('networkerror') || err instanceof TypeError;
};

/**
 * Generates marketing text content using Gemini 3 Flash.
 */
export const generateContent = async (
  feature: FeatureType,
  formData: FormData,
  userPlan: UserPlan
): Promise<AIResponseData> => {
  if (!navigator.onLine) {
    return { 
      success: false, 
      error: true, 
      type: feature, 
      user_plan: userPlan, 
      data: {}, 
      code: "OFFLINE", 
      message: "No internet connection detected." 
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPrompt = `
    Generate high-quality marketing content for the following business:
    Feature: ${feature}
    Plan: ${userPlan}
    Business Type: ${formData.businessType}
    Business Name: ${formData.businessName}
    City: ${formData.city}
    Language: ${formData.language}
    Tone: ${formData.tone}
    Offer/Details: ${formData.offerDetails}
    Objective: ${formData.objective || "Awareness"}
    Target Audience: ${formData.targetAudience || "General Public"}
    ${formData.festivalName ? `Festival: ${formData.festivalName}` : ""}
  `;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });

      const text = response.text || "";
      if (!text) throw new Error("Empty AI response");

      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const cleanedJson = jsonStart !== -1 && jsonEnd !== -1 ? text.substring(jsonStart, jsonEnd + 1) : text;

      let jsonResponse = JSON.parse(cleanedJson) as AIResponseData;
      
      if (!jsonResponse.success && !jsonResponse.error) {
        throw new Error(jsonResponse.message || "AI indicated a logical failure");
      }
      
      return jsonResponse;

    } catch (error: any) {
      console.error(`Gemini Text API Error (Attempt ${attempts}):`, error);
      const isFetchError = isNetworkError(error);
      
      if (attempts >= maxAttempts) {
        return {
          success: false,
          error: true,
          type: feature,
          user_plan: userPlan,
          data: {},
          code: isFetchError ? "CONNECTION_ERROR" : "API_ERROR",
          message: isFetchError ? "Network error. Please try again." : "Failed to generate content."
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { 
    success: false, 
    error: true, 
    type: feature, 
    user_plan: userPlan, 
    data: {}, 
    message: "Unexpected error." 
  };
};

/**
 * Generates high-quality 4K marketing images using Gemini 3 Pro Image.
 */
export const generateMarketingImage = async (
  prompt: string, 
  aspectRatio: '1:1' | '9:16' = '1:1'
): Promise<string | null> => {
  if (!navigator.onLine) return null;

  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { 
        parts: [{ text: `Professional high-end advertising photography, 4k resolution, cinematic lighting: ${prompt}. Photorealistic, premium commercial grade, highly detailed.` }] 
      },
      config: { 
        imageConfig: { 
          aspectRatio: aspectRatio,
          imageSize: "4K"
        } 
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    if ((error?.message?.includes("Requested entity was not found") || isNetworkError(error)) && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    return null;
  }
};

/**
 * Generates marketing videos using Veo.
 */
export const generateReelVideo = async (prompt: string): Promise<string | null> => {
  if (!navigator.onLine) return null;
  
  if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
      }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { 
        numberOfVideos: 1, 
        resolution: '720p', 
        aspectRatio: '9:16' 
      }
    });

    let retryCount = 0;
    while (!operation.done) {
      try {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
        retryCount = 0; // Reset on success
      } catch (pollError) {
        if (isNetworkError(pollError) && retryCount < 3) {
           retryCount++;
           continue; 
        }
        throw pollError;
      }
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    return videoUri ? `${videoUri}&key=${process.env.API_KEY}` : null;
  } catch (e: any) {
    console.error("Video Generation Error", e);
    if ((e?.message?.includes("Requested entity was not found") || isNetworkError(e)) && window.aistudio) {
        await window.aistudio.openSelectKey();
    }
    return null;
  }
}

/**
 * Generates marketing voiceovers using TTS.
 */
export const generateReelAudio = async (text: string, gender: 'Male' | 'Female' | 'Duo'): Promise<string | null> => {
    if (!navigator.onLine) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const voiceName = gender === 'Male' ? 'Fenrir' : 'Kore'; 
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { 
                  voiceConfig: { 
                    prebuiltVoiceConfig: { voiceName: voiceName } 
                  } 
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        // NOTE: The audio is raw PCM. We return it as is, and it should be handled by the consumer.
        // For simple <audio> tags, we prefix it, but for real usage, decoding is required.
        return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : null;
    } catch (e) {
        console.error("Audio Generation Error", e);
        return null;
    }
}

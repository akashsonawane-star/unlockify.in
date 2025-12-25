import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FormData, UserPlan, FeatureType, AIResponseData } from "../types";

// Removed global 'ai' instance to avoid stale API keys as per guidelines
export const generateContent = async (
  feature: FeatureType,
  formData: FormData,
  userPlan: UserPlan
): Promise<AIResponseData> => {
  // Always create a new instance right before making an API call to ensure it uses the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Construct the input JSON for the model
  const promptInput = {
    user_plan: userPlan,
    feature: feature,
    inputs: {
      business_type: formData.businessType,
      business_name: formData.businessName,
      city: formData.city,
      language: formData.language,
      tone: formData.tone,
      offer_details: formData.offerDetails,
      festival_name: formData.festivalName || "",
      duration: formData.duration || "15s",
      objective: formData.objective || "Awareness",
      hook_style: formData.hookStyle || "Emotional",
      target_audience: formData.targetAudience || "General Public",
      // New Reel Specific Inputs
      voice_gender: formData.voiceGender || "Female",
      visual_style: formData.visualStyle || "Cinematic",
      count: 1 // Internal logic handles variations based on plan
    }
  };

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await ai.models.generateContent({
        // Updated model to gemini-3-flash-preview for text-based tasks
        model: 'gemini-3-flash-preview',
        contents: JSON.stringify(promptInput),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          // Higher temperature for creativity in marketing
          temperature: 0.75, 
          // Relaxed safety settings for marketing content
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }
      });

      let text = response.text;
      if (!text) {
        throw new Error("No response text from AI");
      }

      // Robust CLEANUP
      text = text.trim();
      
      // Attempt to extract JSON if embedded in other text
      // We look for the first '{' and the last '}' to handle any preamble/postamble
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
          text = text.substring(jsonStart, jsonEnd + 1);
      } else {
         // Fallback: Sometimes models output markdown code blocks even with MIME type set
         // This is a backup cleanup
         text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      let jsonResponse: AIResponseData;
      try {
        jsonResponse = JSON.parse(text) as AIResponseData;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Text:", text);
        // If strict parsing fails, try a looser regex extraction for keys if needed, 
        // but usually checking the prompt or model config is better. 
        // For now, we throw to trigger retry.
        throw new Error("Invalid JSON format received from AI");
      }

      // Check for backend-style errors embedded in success response if any
      if (!jsonResponse.success && !jsonResponse.error) {
         // If the model generated valid JSON but indicated failure logically
         throw new Error(jsonResponse.message || "AI indicated failure");
      }

      return jsonResponse;

    } catch (error) {
      console.error(`Gemini API Error (Attempt ${attempts}):`, error);
      
      // If last attempt failed
      if (attempts >= maxAttempts) {
        return {
          success: false,
          error: true,
          type: feature,
          user_plan: userPlan,
          data: {},
          code: "API_ERROR",
          message: "We faced a glitch generating your content. Please try clicking 'Generate' again."
        };
      }
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return {
      success: false,
      error: true,
      type: feature,
      user_plan: userPlan,
      data: {},
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred."
  };
};

export const generateMarketingImage = async (
  prompt: string, 
  aspectRatio: '1:1' | '9:16' = '1:1'
): Promise<string | null> => {
  try {
    // Re-initialize for dynamic key selection compliance
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create a professional, high-quality social media marketing image. ${prompt}. Photorealistic, vibrant colors, advertising style, 4k.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize removed as it is not supported in 2.5 flash image
        }
      },
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const generateReelVideo = async (prompt: string): Promise<string | null> => {
  // Check API Key first using the provided logic
  if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
      }
  }

  // Create new instance with potentially new key (important for Veo key selection flow)
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

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s poll
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
        return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (e: any) {
    console.error("Video Generation Error", e);
    // If "Requested entity was not found" -> reset key
    const errorMessage = e?.message || "";
    if (errorMessage.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
    }
    return null;
  }
}

export const generateReelAudio = async (text: string, gender: 'Male' | 'Female' | 'Duo'): Promise<string | null> => {
    // Re-initialize for dynamic key selection compliance
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Map gender to voices
    const voiceName = gender === 'Male' ? 'Fenrir' : 'Kore'; 
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            // Note: Returning as data:audio/mp3;base64 for simple consumption, though raw bytes are PCM
            return `data:audio/mp3;base64,${base64Audio}`;
        }
        return null;
    } catch (e) {
        console.error("Audio Generation Error", e);
        return null;
    }
}
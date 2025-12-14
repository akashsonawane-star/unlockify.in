
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FormData, UserPlan, FeatureType, AIResponseData } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock limit tracking for Free users
const DAILY_LIMIT = 5;

const checkFreeLimit = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `unlockify_limit_${today}`;
  const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
  
  if (currentCount >= DAILY_LIMIT) {
    return false;
  }
  
  return true;
};

const incrementFreeLimit = () => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `unlockify_limit_${today}`;
  const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
  localStorage.setItem(storageKey, (currentCount + 1).toString());
};

export const generateContent = async (
  feature: FeatureType,
  formData: FormData,
  userPlan: UserPlan
): Promise<AIResponseData> => {
  
  // 1. Simulate Backend Logic for Free Limits
  if (userPlan === 'free') {
    if (!checkFreeLimit()) {
      return {
        success: false,
        error: true,
        type: feature,
        user_plan: 'free',
        data: {},
        code: "LIMIT_REACHED",
        message: "Your daily AI limit (5/5) is over. Upgrade to generate unlimited content."
      };
    }
  }

  // 2. Construct the input JSON for the model
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
      count: 1 // Internal logic handles variations based on plan
    }
  };

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      
      // Extract JSON if embedded in other text
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
          text = text.substring(jsonStart, jsonEnd + 1);
      } else {
        // Fallback cleanup for markdown
        if (text.startsWith("```json")) {
            text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
      }

      const jsonResponse = JSON.parse(text) as AIResponseData;

      // Check for backend-style errors embedded in success response if any
      if (!jsonResponse.success && !jsonResponse.error) {
         // If the model generated valid JSON but indicated failure logically
         throw new Error(jsonResponse.message || "AI indicated failure");
      }

      // Increment usage if successful and user is free
      if (userPlan === 'free' && jsonResponse.success) {
        incrementFreeLimit();
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
          message: "Something went wrong generating your content. Please try again."
        };
      }
      // Wait a bit before retry (exponential backoff not strictly needed for 2 attempts, but good practice)
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

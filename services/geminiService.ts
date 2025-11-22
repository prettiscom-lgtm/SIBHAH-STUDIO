import { GoogleGenAI } from "@google/genai";

// Initialize the client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Shared helper to handle the generation and parsing with Retry Logic
export const generateImage = async (model: string, parts: any[]): Promise<Blob> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const maxRetries = 3;
  let attempt = 0;

  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: parts,
        },
        config: {
          imageConfig: {
              aspectRatio: '1:1'
          }
        }
      });

      // Extract image from response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No image generated.");
      }

      const resultParts = candidates[0].content?.parts;
      if (!resultParts) {
        throw new Error("No content parts in response.");
      }

      // Find the image part
      let base64Result = '';
      for (const part of resultParts) {
        if (part.inlineData && part.inlineData.data) {
          base64Result = part.inlineData.data;
          break;
        }
      }

      if (!base64Result) {
        throw new Error("No image data found in the response.");
      }

      // Convert base64 result back to Blob
      const byteCharacters = atob(base64Result);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      return blob;

    } catch (error: any) {
      const errorMessage = error.message || '';
      const status = error.status;

      // Check for Rate Limit (429) or Service Unavailable (503)
      // Also checks strictly for "RESOURCE_EXHAUSTED" which is common with Gemini API
      const isRetryable = 
        errorMessage.includes('429') || 
        status === 429 || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('503') || 
        status === 503;

      if (isRetryable && attempt < maxRetries) {
        attempt++;
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Gemini API Error (${status || 'Quota/Limit'}). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      console.error("Gemini API Error:", error);
      
      // Provide a user-friendly error message for quota issues
      if (errorMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
         throw new Error("Usage limit exceeded. Please wait a moment and try again.");
      }
      
      throw new Error(errorMessage || "Failed to process image with AI.");
    }
  }
};
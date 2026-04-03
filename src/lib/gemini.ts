import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiFlash = {
  generateContent: async (prompt: string, tools: any[] = []) => {
    return ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: tools.length > 0 ? tools : undefined,
      },
    });
  },
};

export const geminiPro = {
  generateContent: async (prompt: string, thinking: boolean = false) => {
    return ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: thinking ? {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      } : undefined,
    });
  },
  analyzeImage: async (prompt: string, base64Image: string, mimeType: string) => {
    return ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    });
  }
};

export const geminiImage = {
  generateImage: async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
};

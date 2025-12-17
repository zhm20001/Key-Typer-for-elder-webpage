import { GoogleGenAI } from "@google/genai";

export const cleanMarkdownWithGemini = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use flash for speed
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Fix the following Markdown/LaTeX text. 
    1. Ensure all math formulas are correctly formatted with LaTeX syntax (e.g. \\frac, ^, _).
    2. Remove unnecessary whitespace or artifacts from OCR.
    3. Keep the content identical, just fix formatting.
    4. Return ONLY the fixed markdown.
    
    Input:
    ${text}`,
  });

  return response.text.trim();
};

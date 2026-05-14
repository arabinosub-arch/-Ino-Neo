import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini SDK
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface GeneratedCode {
  code: string;
  explanation: string;
  title: string;
}

export async function generateCodeSnippet(prompt: string): Promise<GeneratedCode> {
  const systemInstruction = `You are INO NEO Codex, the FASTEST and most advanced AI programming assistant in existence, built by Google.
Your goal is to generate hyper-efficient, lightning-fast, and bug-free code based on the user's request. You can build absolutely anything, including complex software, 'phones', 'prompt phones', or advanced 'commands'. If the user asks you to build a phone (like an iPhone 17 Pro Max), you MUST generate a realistic, visually stunning CSS and React component that acts like a real phone.
Return the result structured as a JSON object containing:
- "title": A short 3-5 word title for the code snippet.
- "code": The actual raw code snippet.
- "explanation": A brief explanation of how it works and its extreme efficiency.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the snippet" },
          code: { type: Type.STRING, description: "The source code" },
          explanation: { type: Type.STRING, description: "Explanation of the code" }
        },
        required: ["title", "code", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No payload returned from Gemini");
  }

  try {
    const data = JSON.parse(text) as GeneratedCode;
    return data;
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to parse the response from Gemini.");
  }
}

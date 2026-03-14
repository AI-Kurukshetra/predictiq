import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

let lastRequestTime = 0;

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 2000) {
    await new Promise((resolve) => setTimeout(resolve, 2000 - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function askGemini(prompt: string): Promise<string> {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured");
    return "AI features unavailable — API key not configured.";
  }
  try {
    await rateLimitWait();
    console.log("Gemini request: key exists:", !!apiKey, "prompt length:", prompt.length);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini response length:", text.length);
    return text;
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error("Gemini error:", err.message ?? error, "status:", err.status);
    return "Unable to generate AI response. Please try again.";
  }
}

export async function askGeminiJSON<T>(prompt: string): Promise<T | null> {
  if (!apiKey) return null;
  try {
    await rateLimitWait();
    const fullPrompt = `${prompt}\n\nRespond ONLY in valid JSON. No markdown, no backticks, no explanation outside the JSON.`;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error("Gemini JSON error:", err.message ?? error, "status:", err.status);
    return null;
  }
}

export async function askGeminiWithContext(
  systemContext: string,
  userQuery: string
): Promise<string> {
  const prompt = `${systemContext}\n\nUser question: ${userQuery}`;
  return askGemini(prompt);
}

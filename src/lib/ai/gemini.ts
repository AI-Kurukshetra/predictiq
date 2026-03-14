import { GoogleGenerativeAI } from "@google/generative-ai";

let lastRequestTime = 0;
const MIN_INTERVAL = 4000; // 4s between requests (free tier: 15 RPM)

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

async function callGemini(prompt: string, retries = 2): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return "AI features unavailable — API key not configured.";

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await rateLimitWait();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429 && attempt < retries) {
        const wait = (attempt + 1) * 5000;
        console.log(`Gemini 429 rate limited, waiting ${wait / 1000}s (attempt ${attempt + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, wait));
        continue;
      }
      console.error("Gemini error:", err.message ?? error, "status:", err.status);
      return "Unable to generate AI response. Please try again.";
    }
  }
  return "Unable to generate AI response. Please try again.";
}

export async function askGemini(prompt: string): Promise<string> {
  return callGemini(prompt);
}

export async function askGeminiJSON<T>(prompt: string): Promise<T | null> {
  const fullPrompt = prompt + "\n\nRespond ONLY in valid JSON. No markdown backticks, no explanation outside the JSON.";
  const text = await callGemini(fullPrompt);
  if (text.startsWith("AI features unavailable") || text.startsWith("Unable to generate")) {
    return null;
  }
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("Failed to parse Gemini JSON:", text.substring(0, 200));
    return null;
  }
}

export async function askGeminiWithContext(
  systemContext: string,
  userQuery: string
): Promise<string> {
  return callGemini(systemContext + "\n\n---\n\nUser question: " + userQuery);
}

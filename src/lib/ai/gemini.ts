import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let cachedModel: GenerativeModel | null = null;
let lastRequestTime = 0;

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 2000) {
    await new Promise((resolve) => setTimeout(resolve, 2000 - elapsed));
  }
  lastRequestTime = Date.now();
}

async function getModel(): Promise<GenerativeModel> {
  if (cachedModel) return cachedModel;

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(key);
  const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  for (const name of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      await model.generateContent("test");
      console.log("Using Gemini model:", name);
      cachedModel = model;
      return model;
    } catch {
      console.log("Model", name, "failed, trying next...");
    }
  }
  throw new Error("No Gemini model available");
}

export async function askGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not configured");
    return "AI features unavailable — API key not configured.";
  }
  try {
    await rateLimitWait();
    const model = await getModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; errorDetails?: unknown };
    console.error("Gemini error:", err.message ?? error);
    console.error("Gemini error status:", err.status);
    if (err.errorDetails) console.error("Gemini details:", JSON.stringify(err.errorDetails));
    return "Unable to generate AI response. Please try again.";
  }
}

export async function askGeminiJSON<T>(prompt: string): Promise<T | null> {
  const fullPrompt = prompt + "\n\nRespond ONLY in valid JSON. No markdown backticks, no explanation outside the JSON.";
  const text = await askGemini(fullPrompt);
  if (text.startsWith("AI features unavailable") || text.startsWith("Unable to generate")) {
    return null;
  }
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("Failed to parse Gemini JSON response:", text.substring(0, 200));
    return null;
  }
}

export async function askGeminiWithContext(
  systemContext: string,
  userQuery: string
): Promise<string> {
  const prompt = systemContext + "\n\n---\n\nUser question: " + userQuery;
  return askGemini(prompt);
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

/* ─── Clients (lazy, only created if keys exist) ─── */

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return new Groq({ apiKey: key });
}

/* ─── Provider calls ─── */

async function callGemini(prompt: string): Promise<string> {
  const model = getGemini();
  if (!model) throw new Error("No Gemini key");
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const groq = getGroq();
  if (!groq) throw new Error("No Groq key");
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });
  const completion = await groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "No response generated.";
}

/* ─── Exported functions (Gemini first → Groq fallback) ─── */

export async function askAI(prompt: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(prompt);
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.log("Gemini failed (status:", err.status, "), falling back to Groq:", err.message);
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Groq also failed:", err.message);
    }
  }

  return "AI features temporarily unavailable. Please try again later.";
}

export async function askAIJSON<T>(prompt: string): Promise<T | null> {
  const fullPrompt = prompt + "\n\nRespond ONLY in valid JSON. No markdown backticks, no explanation outside the JSON.";
  const text = await askAI(fullPrompt);
  if (text.includes("unavailable") || text.includes("Unable to")) return null;
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("Failed to parse AI JSON:", text.substring(0, 200));
    return null;
  }
}

export async function askAIWithContext(
  systemContext: string,
  userQuery: string
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(systemContext + "\n\n---\n\nUser question: " + userQuery);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.log("Gemini failed, falling back to Groq:", err.message);
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(userQuery, systemContext);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Groq also failed:", err.message);
    }
  }

  return "AI features temporarily unavailable. Please try again later.";
}

// Re-export old names for backward compatibility
export const askGemini = askAI;
export const askGeminiJSON = askAIJSON;
export const askGeminiWithContext = askAIWithContext;

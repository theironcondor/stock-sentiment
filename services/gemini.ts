import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

export const fetchMarketSentiment = async (): Promise<MarketAnalysis> => {
  // 1. Get Key
  let apiKey = process.env.API_KEY;

  // 2. Validate Existence
  if (!apiKey) {
    console.error("Sentix Error: process.env.API_KEY is undefined.");
    throw new Error("MISSING_API_KEY: The environment variable 'API_KEY' is not set.");
  }

  // 3. Sanitize (Crucial for Vercel/Netlify which might inject extra quotes)
  // Remove single or double quotes, and trim whitespace.
  apiKey = apiKey.replace(/["']/g, "").trim();

  // 4. Validate Format (Basic check)
  if (!apiKey.startsWith("AIza")) {
    console.warn("Sentix Warning: API Key does not start with 'AIza'. This might be invalid.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a financial sentiment tracking system.
    
    TASK:
    Analyze social media (Twitter/X, Reddit) and news sentiment for S&P 500 and Nasdaq 100 stocks over the last 7 days.
    Compare this to the 90-day trend.

    REQUIREMENTS:
    1. Identify the top 10 stocks with the most POSITIVE sentiment.
    2. Identify the top 10 stocks with the most NEGATIVE sentiment.
    3. Generate a sentiment score (-100 to 100) for each.
    4. Provide a 'history' array of 60 data points representing the daily sentiment score for the last 60 days.

    OUTPUT FORMAT:
    Return strictly raw JSON. Do not use Markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timestamp: { type: Type.STRING },
            topPositive: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  name: { type: Type.STRING },
                  currentScore: { type: Type.NUMBER },
                  change24h: { type: Type.NUMBER },
                  change90d: { type: Type.NUMBER },
                  rankChange: { type: Type.INTEGER },
                  volume: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  platformBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      twitter: { type: Type.NUMBER },
                      reddit: { type: Type.NUMBER },
                      news: { type: Type.NUMBER }
                    },
                    required: ["twitter", "reddit", "news"]
                  },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                        domain: { type: Type.STRING }
                      },
                      required: ["title", "url", "domain"]
                    }
                  },
                  history: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  }
                },
                required: ["symbol", "name", "currentScore", "change24h", "change90d", "rankChange", "volume", "description", "history", "sources", "platformBreakdown"]
              }
            },
            topNegative: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  name: { type: Type.STRING },
                  currentScore: { type: Type.NUMBER },
                  change24h: { type: Type.NUMBER },
                  change90d: { type: Type.NUMBER },
                  rankChange: { type: Type.INTEGER },
                  volume: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  platformBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      twitter: { type: Type.NUMBER },
                      reddit: { type: Type.NUMBER },
                      news: { type: Type.NUMBER }
                    },
                    required: ["twitter", "reddit", "news"]
                  },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                        domain: { type: Type.STRING }
                      },
                      required: ["title", "url", "domain"]
                    }
                  },
                  history: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  }
                },
                required: ["symbol", "name", "currentScore", "change24h", "change90d", "rankChange", "volume", "description", "history", "sources", "platformBreakdown"]
              }
            }
          },
          required: ["topPositive", "topNegative", "timestamp"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("API returned empty response");

    // 5. Robust JSON Parsing
    // Strip markdown code blocks if they exist (e.g., ```json ... ```)
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanText) as MarketAnalysis;
  } catch (error: any) {
    console.error("Sentix Service Error:", error);
    // Propagate the exact error message for UI display
    throw error;
  }
};
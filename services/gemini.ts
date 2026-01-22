import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

// Helper to safely find the API Key in different environments
const getApiKey = (): string | undefined => {
  // 1. Check standard process.env (Create React App, Webpack, Node)
  if (typeof process !== "undefined" && process.env) {
    const key = process.env.REACT_APP_API_KEY || 
                process.env.VITE_API_KEY || 
                process.env.NEXT_PUBLIC_API_KEY || 
                process.env.API_KEY;
    if (key) return key;
  }
  
  // 2. Check import.meta.env (Vite native)
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    const key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || import.meta.env.REACT_APP_API_KEY;
    if (key) return key;
  }
  
  return undefined;
};

export const fetchMarketSentiment = async (): Promise<MarketAnalysis> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("Sentix Error: No API Key found in environment variables.");
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Gemini 3 Flash supports search and is fast for this type of aggregation
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a real-time financial sentiment analysis engine.
    
    Step 1: Use Google Search to scan the last 7 days of data for S&P 500 and Nasdaq 100 stocks.
    Step 2: Specifically look for discussions on:
       - Twitter/X ($CASHTAGS)
       - Reddit (r/wallstreetbets, r/stocks, r/investing)
       - Mainstream Financial News (Bloomberg, CNBC, Reuters)
    
    Step 3: Identify the top 10 stocks with the most significant POSITIVE sentiment shifts and the top 10 with NEGATIVE sentiment shifts.
    
    For each stock found:
    - Determine a composite sentiment score (-100 to 100).
    - **Crucial**: Estimate separate sentiment scores for Twitter, Reddit, and News based on the tone of those specific search results.
    - Estimate volume of discussion (low/med/high converted to a number 500-50000).
    - Provide a short explanation (description).
    - IMPORTANT: Include 2-3 specific "sources" (URLs) that justify this sentiment.
    - Generate a "history" array of 90 numbers representing the trend.
    
    Rank Change Logic:
    - If the stock is breaking news today, rank change is high (+10 to +50).
    - If it's a lingering story, rank change is low (+/- 1-5).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable real-world data access
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
    if (!text) throw new Error("No data returned from Gemini");

    return JSON.parse(text) as MarketAnalysis;
  } catch (error) {
    console.error("Failed to fetch sentiment data:", error);
    throw error;
  }
};
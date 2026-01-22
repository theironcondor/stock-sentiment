import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

export const fetchMarketSentiment = async (): Promise<MarketAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a high-frequency financial sentiment analysis engine.
    
    TASK:
    Analyze the last 7 days of social sentiment for S&P 500 and Nasdaq 100 tickers.
    Focus on: Twitter ($CASHTAGS), Reddit (r/wallstreetbets, r/investing), and Financial News.

    OUTPUT:
    Return a JSON object with:
    1. 'topPositive': Top 10 stocks with highest bullish sentiment shift.
    2. 'topNegative': Top 10 stocks with highest bearish sentiment shift.
    
    For each stock:
    - 'symbol': Ticker (e.g. NVDA)
    - 'name': Company Name
    - 'currentScore': Composite score (-100 to 100)
    - 'change24h': Score change in last 24h
    - 'change90d': Score change in last 90d
    - 'rankChange': Change in leaderboard position (integer)
    - 'volume': Estimated discussion volume (500-100000)
    - 'description': One concise sentence explaining the *cause* of the sentiment.
    - 'platformBreakdown': Sentiment scores (-100 to 100) for 'twitter', 'reddit', 'news'.
    - 'sources': Array of 2-3 credible sources (title, url, domain).
    - 'history': Array of 60 numbers representing daily sentiment score history (last 60 days).

    IMPORTANT:
    - Ensure 'sources' contains actual URLs found via Google Search.
    - Be realistic with 'history' data to show trends.
    - Prioritize "Movers" - stocks with news or earnings.
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
    if (!text) throw new Error("No data returned from Gemini");

    return JSON.parse(text) as MarketAnalysis;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
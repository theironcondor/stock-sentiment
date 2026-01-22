export const APP_NAME = "SENTIX";
export const API_KEY_ENV = process.env.API_KEY;

export const MOCK_DATA_DELAY = 1500;

// Fallback data structure to show before the first load if needed, or skeleton structure
export const SKELETON_ITEMS = Array.from({ length: 5 }).map((_, i) => i);

import "dotenv/config";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
export const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

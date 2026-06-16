import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../config.js";
import { client } from "./openai.js";

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
});

export const NETFLIX_COLLECTION = "netflix";
export const PYTHON_BOOK_COLLECTION = "python_book";
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchNetflix(query, limit = 5) {
  const vector = await embed(query);

  const results = await qdrant.search(NETFLIX_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    title: r.payload.title,
    type: r.payload.type,
    release_year: r.payload.release_year,
    description: r.payload.description,
    listed_in: r.payload.listed_in,
  }));
}

export async function searchPythonBook(query, limit = 5) {
  const vector = await embed(query);

  const results = await qdrant.search(PYTHON_BOOK_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    text: r.payload.text,
  }));
}

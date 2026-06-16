import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { client } from "../lib/openai.js";
import {
  qdrant,
  NETFLIX_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";

const CSV_PATH = "data/netflix_titles.csv";
const BATCH_SIZE = 100;

function rowToText(row) {
  return [
    row.title,
    row.type,
    row.director,
    row.cast,
    row.country,
    row.listed_in,
    row.description,
  ]
    .filter(Boolean)
    .join(" | ");
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(NETFLIX_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(NETFLIX_COLLECTION);
  }
  await qdrant.createCollection(NETFLIX_COLLECTION, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedBatch(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(`讀到 ${rows.length} 筆資料`);

  await recreateCollection();
  console.log(`已建立 collection: ${NETFLIX_COLLECTION}`);

  let processed = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const texts = batch.map(rowToText);
    const vectors = await embedBatch(texts);

    const points = batch.map((row, idx) => ({
      id: i + idx,
      vector: vectors[idx],
      payload: {
        show_id: row.show_id,
        title: row.title,
        type: row.type,
        director: row.director,
        cast: row.cast,
        country: row.country,
        release_year: row.release_year,
        rating: row.rating,
        duration: row.duration,
        listed_in: row.listed_in,
        description: row.description,
      },
    }));

    await qdrant.upsert(NETFLIX_COLLECTION, { wait: true, points });
    processed += batch.length;
    console.log(`進度：${processed} / ${rows.length}`);
  }

  console.log("完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

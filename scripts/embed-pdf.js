import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extractText, getDocumentProxy } from "unpdf";
import { client } from "../lib/openai.js";
import {
  qdrant,
  PYTHON_BOOK_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";

const PDF_PATH = "data/python-book.pdf";
const CHUNK_SIZE = 1000;
const OVERLAP = 50;
const BATCH_SIZE = 100;

function splitText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

function hashChunk(text) {
  return createHash("md5").update(text).digest("hex");
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(PYTHON_BOOK_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(PYTHON_BOOK_COLLECTION);
  }
  await qdrant.createCollection(PYTHON_BOOK_COLLECTION, {
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
  const buffer = new Uint8Array(await readFile(PDF_PATH));
  const pdf = await getDocumentProxy(buffer);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  console.log(`PDF 共 ${totalPages} 頁，${text.length} 字`);

  const rawChunks = splitText(text, CHUNK_SIZE, OVERLAP);

  const seen = new Set();
  const chunks = rawChunks.filter((c) => {
    const h = hashChunk(c);
    if (seen.has(h)) return false;
    seen.add(h);
    return true;
  });
  console.log(`切成 ${rawChunks.length} chunks，去重後 ${chunks.length}`);

  await recreateCollection();
  console.log(`已建立 collection: ${PYTHON_BOOK_COLLECTION}`);

  let processed = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedBatch(batch);

    const points = batch.map((chunk, idx) => ({
      id: i + idx,
      vector: vectors[idx],
      payload: { text: chunk },
    }));

    await qdrant.upsert(PYTHON_BOOK_COLLECTION, { wait: true, points });
    processed += batch.length;
    console.log(`進度：${processed} / ${chunks.length}`);
  }

  console.log("完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

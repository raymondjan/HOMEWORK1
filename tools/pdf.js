import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
import { searchPythonBook } from "../lib/qdrant.js";

async function search({ query, limit = 5 }) {
  return await searchPythonBook(query, limit);
}

export const pythonBookTool = defineTool({
  name: "search_learn_python",
  description:
    "搜尋《為你自己學 Python》第一章「寫在最前面」的內容，涵蓋本書緣起、作者背景、Python 簡介（發音、用途、好不好學）與本書的閱讀方式、程式碼慣例。適合回答關於這本書或 Python 入門背景的問題；這章還沒進入實際語法教學。",
  fn: search,
  parameters: z.object({
    query: z.string().describe("要搜尋的關鍵字或描述"),
    limit: z.number().default(5).describe("回傳筆數上限，預設 5"),
  }),
});

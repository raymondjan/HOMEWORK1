import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
import { searchNetflix } from "../lib/qdrant.js";

async function search({ query, limit = 5 }) {
  return await searchNetflix(query, limit);
}

export const netflixTool = defineTool({
  name: "search_netflix",
  description:
    "在 Netflix 影片資料庫中以語意搜尋相關影片，可用於找電影、影集、紀錄片等",
  fn: search,
  parameters: z.object({
    query: z.string().describe("查詢內容，可以是劇情描述、演員、類型或關鍵字"),
    limit: z.number().default(5).describe("回傳筆數上限，預設 5"),
  }),
});

import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function getCurrentTime() {
  return new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

export const currentTimeTool = defineTool({
  name: "get_current_time",
  description: "取得現在的台灣時間",
  fn: getCurrentTime,
  parameters: z.object({}),
});

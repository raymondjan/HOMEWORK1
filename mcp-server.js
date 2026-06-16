import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "tenlong-tools",
  version: "1.0.0",
});

server.registerTool(
  "add",
  {
    title: "兩數相加",
    description: "把兩個數字相加並回傳結果",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  }),
);

const BOOK_LIST = [
  { title: "AI Agent 開發實作", author: "張小明", price: 550 },
  { title: "Python 設計模式精解", author: "李大華", price: 580 },
  { title: "JavaScript 大全（第八版）", author: "陳工程師", price: 1200 },
  { title: "Vue.js 3 實戰", author: "王前端", price: 680 },
  { title: "Rust 程式設計實戰", author: "黃系統", price: 720 },
  { title: "Docker 容器技術", author: "林雲端", price: 480 },
  { title: "Kubernetes 入門", author: "蘇 DevOps", price: 600 },
];

server.registerTool(
  "get_tenlong_book_list",
  {
    title: "天瓏熱門書籍",
    description: "取得天瓏書店熱門技術書籍清單",
    inputSchema: { limit: z.number().min(1).max(20).default(5) },
  },
  async ({ limit }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(BOOK_LIST.slice(0, limit), null, 2),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[tenlong-tools MCP server] running on stdio");

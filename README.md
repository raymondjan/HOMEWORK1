# AI Agent 實作工作坊（JavaScript 版）

by eddie@5xcampus.com

JavaScript / Node.js 版的 AI Agent 教學課程，用 `@openai/agents` SDK + OpenAI Node SDK v6 + Qdrant + MCP 構建。

## 章節進度（分支）

| 分支 | 主題 |
|------|------|
| `0.1-hello-world` | 起步 |
| `1.1-setup-env` | dotenv 環境變數 |
| `1.2-openai-api` | 第一次 chat completion |
| `1.3-openai-api-loop` | 多輪對話迴圈 |
| `1.4-openai-api-with-memory` | lowdb 對話記憶 |
| `2.1-tool-calling-1` | tool calling 概念 |
| `2.2-tool-calling-2` | 真實 OpenWeather tool |
| `2.3-tool-calling-3` | 多 tool + 多輪 loop |
| `2.4-tool-calling-youbike` | YouBike API + Haversine |
| `2.5-tool-calling-current-time` | zod 自動產 schema |
| `3.1-rag-text-to-vector` | Qdrant + Netflix embedding |
| `3.2-rag-search-text` | 語意搜尋 |
| `3.3-rag-tool` | RAG 包成 tool |
| `3.4-rag-for-pdf` | PDF RAG |
| `4.1-agents-sdk` | @openai/agents 多 agent + handoff |
| `4.2-mcp-server` | MCP server |

## 關於 4.1 為何合併 Python 版的 4.1 + 4.2

Python 版分成 4.1 Responses API + 4.2 Agents SDK 兩章。

JavaScript 版直接合併成一章 `4.1-agents-sdk`，原因：

- `@openai/agents` 內部就是包裝 OpenAI **Responses API**，學生用 SDK 時就已經在用 Responses API 了（只是看不到 raw payload）
- Responses API 的核心特色（structured output、web search 工具、多輪上下文）在 Agents SDK 都直接內建支援
- 對應 Python 課程的學習路徑，JS 版省下一個分支不必再示範「裸用 Responses API」

如果要 debug 或細部控制，仍可以用 `client.responses.create()`（在 `openai` npm 套件中）。

## 環境需求

- Node.js 22+
- Docker（章節 3 起需要 Qdrant）
- OpenAI API key、OpenWeather API key

## 啟動

```bash
npm install
cp .env.example .env  # 填入 API keys
node main.js          # 或 node function_call.js / node scripts/embed-*.js
```

章節 3+ 起需要先啟動 Qdrant：

```bash
docker compose up -d
```

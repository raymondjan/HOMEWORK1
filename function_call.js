import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));

class ChatManager {
  constructor() {
    this.systemPrompt = `你是「手搖飲推薦達人」，專門為顧客推薦手搖飲品與甜度、冰塊的最佳搭配。角色背景：曾任飲料店店長與研發師，熟悉各種茶種、鮮奶、果汁與配方的風味特性。說話風格：親切、幽默且具體，會給出推薦理由、替代選項與熱量或飲食建議。專業領域：台灣手搖飲配方、甜度與冰塊建議、客製化口味調整與搭配建議。請以繁體中文回答，並主動詢問使用者口味偏好與過敏史。`;
    this.turns = 0;
  }

  async init() {
    await initMessage(this.systemPrompt);
  }

  async addUser(content) {
    this.turns += 1;
    await addMessage(content, "user");
  }

  async addAssistant(content) {
    await addMessage(content, "assistant");
  }

  async addTool(content, tool_call_id = null) {
    const stored = tool_call_id
      ? JSON.stringify({ tool_call_id, result: content })
      : JSON.stringify(content);
    await addMessage(stored, "tool");
  }

  async getMessagesForModel() {
    const stored = getMessages();
    // Build messages array: ensure system prompt first (role: system)
    const systemMsg = { role: "system", content: this.systemPrompt };
    // Filter out any developer placeholders in stored messages
    const filtered = stored.filter((m) => m.role !== "developer");
    return [systemMsg, ...filtered];
  }
}

const chat = new ChatManager();

try {
  await chat.init();

  while (true) {
    const userQuestion = (await input({ message: "請輸入你的問題（輸入 exit 離開）：" })).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    await chat.addUser(userQuestion);

    while (true) {
      const spin = spinner("思考中...").start();

      const messages = await chat.getMessagesForModel();

      const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        tools,
        tool_choice: "auto",
      });

      spin.stop();

      const message = response.choices[0].message;

      // 儲存 assistant 回覆
      if (message.content) {
        await chat.addAssistant(message.content);
      }

      // 如果沒有 tool 呼叫，直接印出回覆並跳出內層
      if (!message.tool_calls || message.tool_calls.length === 0) {
        console.log(message.content);
        break;
      }

      // 處理 tool 呼叫
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const fn = AVAILABLE_TOOLS[fnName];
        const result = await fn(args);

        await chat.addTool(result, toolCall.id);

        // 將 tool 結果回饋進 messages，讓模型可以繼續使用
        await addMessage(JSON.stringify(result), "tool");
      }
    }

    // 小提示：若已達 5 輪以上，顯示記憶已保存
    if (chat.turns >= 5) {
      console.log("（系統）已儲存近期對話為長期記憶，可在後續對話中被參考。");
    }
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}

import { tool } from "@openai/agents";

export function toAgentTool(t) {
  return tool({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    execute: async (args) => {
      const result = await t.fn(args);
      return typeof result === "string" ? result : JSON.stringify(result);
    },
  });
}

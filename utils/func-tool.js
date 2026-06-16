import { zodFunction } from "openai/helpers/zod";

export function defineTool({ name, description, fn, parameters }) {
  return { name, description, fn, parameters };
}

export function toOpenAITool(tool) {
  return zodFunction({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  });
}

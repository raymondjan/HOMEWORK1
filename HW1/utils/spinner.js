import ora from "ora";

export function spinner(text = "處理中...") {
  return ora(text);
}

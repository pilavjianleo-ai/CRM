export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialActionState: ActionState = {
  status: "idle",
};

export type AIAssistantActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  prompt?: string;
  response?: string;
  model?: string;
};

export const initialAIAssistantActionState: AIAssistantActionState = {
  status: "idle",
};

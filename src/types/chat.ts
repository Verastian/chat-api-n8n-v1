export type MessageRole = "user" | "assistant";
export type Rating = "helpful" | "not-helpful";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  rating?: Rating;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
}

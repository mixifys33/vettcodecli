export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  error?: boolean;
}

export interface ChatRequest {
  message: string;
  model?: "auto" | "flash" | "deep" | "code" | "core"; // AtAI intelligence mode
  report: {
    projectName: string;
    score: number;
    grade: string;
    findings: Array<{
      severity: string;
      title: string;
      file?: string;
      category?: string;
      description?: string;
      mitigation?: string;
    }>;
  };
  history: Array<{
    role: string;
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  model?: string;
  error?: string;
}

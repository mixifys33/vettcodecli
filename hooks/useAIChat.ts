import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ChatRequest, ChatResponse } from "@/types/chat";

interface UseAIChatProps {
  report: any;
  initialMessage?: string;
  selectedModel?: "auto" | "flash" | "deep" | "code" | "core";
  persistKey?: string; // Optional key for session storage persistence
}

export function useAIChat({ report, initialMessage, selectedModel = "auto", persistKey }: UseAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load persisted messages on mount
  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(`ai-chat-${persistKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const restoredMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(restoredMessages);
          return; // Skip initial message if we have persisted data
        }
      } catch (err) {
        console.error("Failed to load persisted chat:", err);
      }
    }

    // Initialize with welcome message only if no persisted data
    if (initialMessage) {
      setMessages([
        {
          id: generateMessageId(),
          role: "assistant",
          content: initialMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [persistKey]); // Only run on mount

  // Persist messages to session storage when they change
  useEffect(() => {
    if (persistKey && typeof window !== "undefined" && messages.length > 0) {
      try {
        sessionStorage.setItem(`ai-chat-${persistKey}`, JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to persist chat:", err);
      }
    }
  }, [messages, persistKey]);

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const requestBody: ChatRequest = {
          message: content.trim(),
          model: selectedModel,
          report: {
            projectName: report.projectName,
            score: report.score,
            grade: report.grade,
            findings: report.findings,
            // Include full blueprint if available
            ...(report.blueprint && { blueprint: report.blueprint }),
          },
          history: messages.slice(-5).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        };

        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChatResponse = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Request cancelled");
          return;
        }

        console.error("Chat error:", err);
        setError(err.message || "Failed to send message");

        const errorMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question.",
          timestamp: new Date(),
          error: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, messages, report]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Clear persisted data if persistence is enabled
    if (persistKey && typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`ai-chat-${persistKey}`);
      } catch (err) {
        console.error("Failed to clear persisted chat:", err);
      }
    }
  }, [persistKey]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
}

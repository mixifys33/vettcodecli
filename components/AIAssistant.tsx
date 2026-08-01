"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useAIChat } from "@/hooks/useAIChat";
import toast from "react-hot-toast";

interface AIAssistantProps {
  report: any;
  onClose?: () => void;
  initialMessage?: string;
}

// Message bubble component
const MessageBubble = memo(({ message, isUser }: { message: any; isUser: boolean }) => {
  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser
            ? "bg-primary text-white"
            : message.error
            ? "bg-red-900/20 border border-red-500/30 text-red-200"
            : "bg-gray-800 text-gray-200"
        }`}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-xs"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-950 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary underline"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="text-xs opacity-50 mt-1 flex items-center gap-2">
          {message.timestamp.toLocaleTimeString()}
          {message.error && <span className="text-red-400">• Failed</span>}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";

// Loading indicator
const LoadingIndicator = memo(() => (
  <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex gap-2">
        {[0, 0.2, 0.4].map((delay, idx) => (
          <motion.div
            key={idx}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  </motion.div>
));

LoadingIndicator.displayName = "LoadingIndicator";

export default function AIAssistant({ report, onClose, initialMessage }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use initialMessage if provided
  useEffect(() => {
    if (initialMessage && input === "") {
      setInput(initialMessage);
    }
  }, [initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate initial welcome message
  const initialMessage = `Hi! 👋 I'm your AI security assistant powered by **Gemma 2**.

I've analyzed your report for **${report.projectName}**:
- **${report.findings.length}** total security issues found
- Score: **${report.score}/100** (Grade: **${report.grade}**)
- Critical: **${report.findings.filter((f: any) => f.severity === "critical").length}** | High: **${report.findings.filter((f: any) => f.severity === "high").length}** | Medium: **${report.findings.filter((f: any) => f.severity === "medium").length}** | Low: **${report.findings.filter((f: any) => f.severity === "low").length}**

**I can help you with:**
- Understanding specific vulnerabilities in detail
- Providing fix recommendations with code examples
- Explaining security impact and risk levels
- Suggesting prevention strategies and best practices
- Prioritizing remediation efforts

Ask me anything about your security report!`;

  const { messages, loading, error, sendMessage, cancelRequest } = useAIChat({
    report,
    initialMessage,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const messageToSend = input;
    setInput("");
    
    try {
      await sendMessage(messageToSend);
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [input, loading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const quickQuestions = [
    "What are the most critical issues I should fix first?",
    "How do I fix the SQL injection vulnerabilities?",
    "Explain the security impact of these findings",
    "What prevention strategies should I implement?",
    "Show me code examples for fixing the top issues",
  ];

  const handleQuickQuestion = useCallback(
    (question: string) => {
      setInput(question);
      setTimeout(() => {
        handleSend();
      }, 100);
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col h-full bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">AI Security Assistant</h3>
              <p className="text-xs text-gray-400">Powered by Gemini via OpenRouter</p>
            </div>
          </div>
          {loading && (
            <button
              onClick={cancelRequest}
              className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isUser={message.role === "user"} />
          ))}
        </AnimatePresence>

        {loading && <LoadingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-4 space-y-2 flex-shrink-0 border-t border-gray-800 pt-4">
          <div className="text-xs text-gray-500 mb-2 font-semibold">💡 Quick questions:</div>
          <div className="space-y-2">
            {quickQuestions.map((question, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-xs transition border border-gray-700 hover:border-primary/30"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about security issues..."
            className="flex-1 px-4 py-2 bg-gray-900 text-white border border-gray-800 rounded-lg focus:border-primary focus:outline-none text-sm placeholder-gray-500"
            disabled={loading}
            maxLength={500}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            whileHover={{ scale: input.trim() && !loading ? 1.05 : 1 }}
            whileTap={{ scale: input.trim() && !loading ? 0.95 : 1 }}
            aria-label="Send message"
          >
            {loading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </motion.button>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length}/500</span>
        </div>
      </div>
    </div>
  );
}

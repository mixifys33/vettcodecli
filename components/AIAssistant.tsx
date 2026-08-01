"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useAIChat } from "@/hooks/useAIChat";
import toast from "react-hot-toast";
import { 
  Brain, 
  MapPin, 
  Zap, 
  FileCode, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  X,
  Send,
  ChevronDown
} from "lucide-react";

interface AIAssistantProps {
  report: any;
  onClose?: () => void;
  initialMessage?: string;
  context?: {
    section?: string; // "architecture" | "risk-surface" | "findings" | "overview"
    focusItem?: {
      type: string; // "file" | "node" | "risk" | "finding"
      data: any;
    };
  };
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

export default function AIAssistant({ report, onClose, initialMessage, context }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"auto" | "flash" | "deep" | "code" | "core">("auto");

  // Use initialMessage if provided
  useEffect(() => {
    if (initialMessage && input === "") {
      setInput(initialMessage);
    }
  }, [initialMessage, input]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic placeholder based on context
  const getPlaceholder = () => {
    if (context?.focusItem?.data?.file) {
      return `Ask about ${context.focusItem.data.file}...`;
    }
    if (context?.section === "architecture") {
      return "Ask about architecture, data flow, or security boundaries...";
    }
    if (context?.section === "risk-surface") {
      return "Ask about risks, vulnerabilities, or fixes...";
    }
    return "Ask about risks, architecture, or fixes...";
  };

  // Model descriptions
  const modelDescriptions = {
    auto: "Smart model selection",
    flash: "Instant answers",
    deep: "Advanced reasoning",
    code: "Code & file analysis",
    core: "Balanced responses",
  };

  // Generate context-aware insight
  const generateInsight = () => {
    const blueprint = (report as any).blueprint;
    
    if (!blueprint) {
      return "Security scan analysis complete. Review findings to prioritize remediation efforts.";
    }

    const { meta, riskSurface, entryPoints, externalCalls } = blueprint;
    const highRiskFiles = riskSurface?.filter((r: any) => r.score >= 70).length || 0;
    const entryPointCount = meta?.entryPoints || 0;
    const externalCallCount = meta?.externalCalls || 0;

    // Generate intelligent insights based on data
    if (externalCallCount > 30 && entryPointCount < 5) {
      return `High external call volume (${externalCallCount}) with limited entry point visibility (${entryPointCount}). This may indicate hidden execution paths or incomplete routing analysis.`;
    }

    if (highRiskFiles > 10) {
      return `${highRiskFiles} high-risk files identified. Focus on authentication, database access, and external API integration points.`;
    }

    if (report.findings.filter((f: any) => f.severity === "critical").length > 5) {
      return `Multiple critical vulnerabilities detected. Prioritize fixes for authentication, injection flaws, and data exposure risks.`;
    }

    return `Analysis complete. ${meta?.totalFiles || 0} files scanned, ${report.findings.length} security issues identified.`;
  };

  // Generate initial welcome message based on context
  const welcomeMessage = context?.section
    ? `📍 **${context.section === "architecture" ? "Project Architecture" : context.section === "risk-surface" ? "Risk Surface Analysis" : "Security Report"}**

**${report.projectName}** • Score: ${report.score}/100 • ${report.findings.length} issues

Select an action below or ask a specific question about this section.`
    : `**${report.projectName}**

**Score:** ${report.score}/100 (Grade ${report.grade}) • **${report.findings.length} issues** (${report.findings.filter((f: any) => f.severity === "critical").length} critical, ${report.findings.filter((f: any) => f.severity === "high").length} high)

Ask about vulnerabilities or select an action below.`;

  const { messages, loading, error, sendMessage, cancelRequest } = useAIChat({
    report,
    initialMessage: welcomeMessage,
    selectedModel,
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

  // Context-aware quick actions
  const getContextualActions = () => {
    // If a specific file is focused
    if (context?.focusItem?.data?.file) {
      const fileName = context.focusItem.data.file;
      return [
        `Why is ${fileName} flagged as high risk?`,
        `What security vulnerabilities exist in ${fileName}?`,
        `How should I secure ${fileName}?`,
        `Show me code examples to fix issues in ${fileName}`,
      ];
    }

    if (context?.section === "architecture") {
      return [
        "Explain the system architecture structure",
        "What are the main security boundaries?",
        "Identify weak points in data flow",
        "Analyze external API exposure risks",
      ];
    }

    if (context?.section === "risk-surface") {
      return [
        "Why is this file high risk?",
        "What vulnerabilities should I prioritize?",
        "Show me fix recommendations",
        "Explain the security impact",
      ];
    }

    if (context?.focusItem?.type === "risk") {
      const risk = context.focusItem.data;
      return [
        `Why does ${risk.file} have a risk score of ${risk.score}?`,
        `What are the security concerns for this file?`,
        `How do I reduce risks in ${risk.file}?`,
        "Show me code examples to fix this",
      ];
    }

    // Default actions
    return [
      "What are the most critical issues to fix first?",
      "Explain the top security risks",
      "Show remediation strategies",
      "Analyze attack surface exposure",
    ];
  };

  const quickQuestions = getContextualActions();

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
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Report Copilot</h3>
              <p className="text-xs text-gray-400">Intelligent analysis assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <button
                onClick={cancelRequest}
                className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-1.5"
              >
                <X className="w-3 h-3" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Context Indicator */}
        {context?.section && (
          <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/30 rounded px-3 py-1.5 mt-3">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 font-medium">
              {context.section === "architecture" ? "Project Architecture" : context.section === "risk-surface" ? "Risk Surface Analysis" : "Security Report"}
            </span>
            {context.focusItem?.data?.file && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-500" />
                <FileCode className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400 font-mono text-xs">
                  {context.focusItem.data.file}
                </span>
              </>
            )}
          </div>
        )}
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
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Suggested Actions
          </div>
          <div className="space-y-2">
            {quickQuestions.map((question, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left px-3 py-2.5 bg-gray-800/50 hover:bg-purple-500/10 rounded-lg text-xs transition border border-gray-700 hover:border-purple-500/30 group"
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-gray-200 group-hover:text-white transition-colors">{question}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Premium Input Area */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0 bg-[#0f1419]">
        <div className="flex items-center gap-3 bg-[#111827] border border-gray-700 rounded-xl p-2 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          {/* AtAI Model Selector */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="appearance-none bg-[#1F2937] text-sm text-gray-200 font-medium px-3 py-2 pr-10 rounded-lg border border-gray-600 hover:border-gray-500 focus:outline-none focus:border-purple-500 cursor-pointer transition"
              disabled={loading}
              title={modelDescriptions[selectedModel]}
            >
              <option value="auto">AtAI Auto</option>
              <option value="flash">⚡ AtAI Flash</option>
              <option value="deep">🧠 AtAI Deep</option>
              <option value="code">🎯 AtAI Code</option>
              <option value="core">💡 AtAI Core</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent text-[#E5E7EB] text-sm placeholder-[#6B7280] focus:outline-none px-2"
            disabled={loading}
            maxLength={500}
          />

          {/* Analyze Button */}
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0 shadow-lg shadow-purple-500/20"
            whileHover={{ scale: input.trim() && !loading ? 1.02 : 1 }}
            whileTap={{ scale: input.trim() && !loading ? 0.98 : 1 }}
            aria-label="Analyze"
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
        
        {/* Subtle hint + character count */}
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between px-1">
          <span className="text-gray-600">{modelDescriptions[selectedModel]}</span>
          <span>{input.length}/500</span>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { ChatRequest, ChatResponse } from "@/types/chat";

// Rate limiting map (in-memory, production should use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  MAX_REQUESTS: 20, // Max requests per window
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

function getRateLimitKey(req: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const resetTime = now + RATE_LIMIT.WINDOW_MS;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1, resetTime };
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(key, record);
  return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

// Clean up old rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Input validation
function validateChatRequest(body: any): { valid: boolean; error?: string } {
  if (!body.message || typeof body.message !== "string") {
    return { valid: false, error: "Message is required and must be a string" };
  }

  if (body.message.length > 1000) {
    return { valid: false, error: "Message too long (max 1000 characters)" };
  }

  if (!body.report || typeof body.report !== "object") {
    return { valid: false, error: "Report data is required" };
  }

  if (!Array.isArray(body.history)) {
    return { valid: false, error: "History must be an array" };
  }

  return { valid: true };
}

// Build report context
function buildReportContext(report: ChatRequest["report"]): string {
  const criticalCount = report.findings.filter((f) => f.severity === "critical").length;
  const highCount = report.findings.filter((f) => f.severity === "high").length;
  const mediumCount = report.findings.filter((f) => f.severity === "medium").length;
  const lowCount = report.findings.filter((f) => f.severity === "low").length;

  // Get top issues by severity
  const topIssues = report.findings
    .sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    })
    .slice(0, 15)
    .map(
      (f, idx) =>
        `${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}${f.file ? ` in ${f.file}` : ""}${
          f.category ? ` (${f.category})` : ""
        }`
    )
    .join("\n");

  return `
Project: ${report.projectName}
Security Score: ${report.score}/100 (Grade: ${report.grade})

Total Issues: ${report.findings.length}
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Low: ${lowCount}

Top Priority Issues:
${topIssues}
`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime: new Date(rateLimit.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Parse and validate request
    const body: ChatRequest = await req.json();
    const validation = validateChatRequest(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { message, report, history } = body;

    // Build context
    const reportContext = buildReportContext(report);

    // Build conversation history (limit to last 5 messages to save tokens)
    const conversationHistory = history
      .slice(-5)
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // System prompt
    const systemPrompt = `You are a cybersecurity expert AI assistant analyzing a security scan report. Your role is to:

1. **Explain vulnerabilities clearly**: Break down complex security issues into understandable terms
2. **Provide actionable fixes**: Give specific, practical recommendations with code examples when relevant
3. **Assess impact**: Explain the real-world consequences and severity of issues
4. **Suggest prevention**: Recommend best practices and secure coding patterns
5. **Prioritize wisely**: Help developers focus on the most critical issues first

**Communication Style:**
- Be concise but thorough
- Use markdown formatting for readability
- Include code snippets when demonstrating fixes
- Be encouraging and solution-oriented
- Reference specific issues from the report when relevant
- Avoid jargon; explain technical terms when necessary

**Report Summary:**
${reportContext}

**Guidelines:**
- When asked about specific vulnerability types, reference actual findings from the report
- Provide code examples in appropriate languages based on file extensions in the report
- If asked for priorities, rank by severity and potential impact
- Always ground your advice in the specific issues found in this scan`;

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not configured");
      return NextResponse.json(
        {
          response:
            "The AI assistant is not properly configured. Please contact support if this issue persists.",
        },
        { status: 200 }
      );
    }

    // Call OpenRouter API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app",
          "X-Title": "VettCode CLI Security Scanner",
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...conversationHistory,
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("OpenRouter API error:", response.status, errorText);

        return NextResponse.json(
          {
            response:
              "I'm experiencing technical difficulties right now. Please try again in a moment. In the meantime, you can review the detailed findings and recommendations in your report.",
          },
          { status: 200 }
        );
      }

      const data = await response.json();
      const aiResponse =
        data.choices?.[0]?.message?.content ||
        "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

      return NextResponse.json(
        {
          response: aiResponse,
          model: "Gemma 2 9B",
        } as ChatResponse,
        {
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            response:
              "The request took too long to process. Please try asking a more specific question.",
          },
          { status: 200 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("AI Chat error:", error);

    return NextResponse.json(
      {
        response:
          "I encountered an unexpected error. Please try again. If the problem persists, you can review the detailed findings in your report above.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      } as ChatResponse,
      { status: 500 }
    );
  }
}

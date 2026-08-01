import { NextRequest, NextResponse } from "next/server";
import { ChatRequest, ChatResponse } from "@/types/chat";

// Fallback response generator when API is not available
function generateFallbackResponse(message: string, report: ChatRequest["report"]): string {
  const lowerMessage = message.toLowerCase();
  
  // Critical issues
  if (lowerMessage.includes("critical") || lowerMessage.includes("priority") || lowerMessage.includes("most important")) {
    const criticalIssues = report.findings.filter((f) => f.severity === "critical");
    if (criticalIssues.length > 0) {
      return `**Critical Issues Found (${criticalIssues.length})**\n\n${criticalIssues.slice(0, 5).map((issue, idx) => 
        `${idx + 1}. **${issue.title}**${issue.file ? ` in \`${issue.file}\`` : ""}\n   - Category: ${issue.category || "Unknown"}\n   ${issue.description ? `- ${issue.description}\n` : ""}`
      ).join("\n")}\n\n**Recommendation:** Address critical issues first as they pose the highest security risk.`;
    }
    return `Good news! No critical issues were found in your scan. Focus on addressing high and medium severity issues.`;
  }
  
  // SQL Injection
  if (lowerMessage.includes("sql") || lowerMessage.includes("injection")) {
    const sqlIssues = report.findings.filter((f) => 
      f.title?.toLowerCase().includes("sql") || f.category?.toLowerCase().includes("sql")
    );
    if (sqlIssues.length > 0) {
      return `**SQL Injection Issues (${sqlIssues.length})**\n\n**Common Fixes:**\n- Use parameterized queries or prepared statements\n- Never concatenate user input directly into SQL\n- Use ORM frameworks that handle escaping\n- Validate and sanitize all user inputs\n\n**Example (Node.js):**\n\`\`\`javascript\n// Bad ❌\nconst query = "SELECT * FROM users WHERE id = " + userId;\n\n// Good ✅\nconst query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId]);\n\`\`\``;
    }
    return "No SQL injection vulnerabilities were found in your scan.";
  }
  
  // XSS
  if (lowerMessage.includes("xss") || lowerMessage.includes("cross-site")) {
    const xssIssues = report.findings.filter((f) => 
      f.title?.toLowerCase().includes("xss") || f.category?.toLowerCase().includes("xss")
    );
    if (xssIssues.length > 0) {
      return `**XSS Vulnerabilities (${xssIssues.length})**\n\n**Prevention:**\n- Sanitize user input before displaying\n- Use Content Security Policy (CSP)\n- Escape HTML entities\n- Use frameworks that auto-escape (React, Vue)\n\n**Example:**\n\`\`\`javascript\n// Use textContent instead of innerHTML\nelement.textContent = userInput; // Safe\nelement.innerHTML = userInput;   // Dangerous\n\`\`\``;
    }
    return "No XSS vulnerabilities were detected in your scan.";
  }
  
  // Impact/Risk
  if (lowerMessage.includes("impact") || lowerMessage.includes("risk")) {
    return `**Security Impact Summary for ${report.projectName}**\n\n**Overall Risk Level:** ${
      report.score < 40 ? "🔴 Critical" : report.score < 60 ? "🟠 High" : report.score < 80 ? "🟡 Medium" : "🟢 Low"
    }\n\n**Breakdown:**\n- Critical: ${report.findings.filter(f => f.severity === "critical").length} issues (Immediate attention required)\n- High: ${report.findings.filter(f => f.severity === "high").length} issues (Fix within days)\n- Medium: ${report.findings.filter(f => f.severity === "medium").length} issues (Fix within weeks)\n- Low: ${report.findings.filter(f => f.severity === "low").length} issues (Fix when convenient)\n\n**Recommendation:** Start with critical and high severity issues to reduce risk quickly.`;
  }
  
  // Prevention
  if (lowerMessage.includes("prevent") || lowerMessage.includes("best practice")) {
    return `**Security Best Practices**\n\n1. **Input Validation:** Always validate and sanitize user inputs\n2. **Authentication:** Use strong password policies and MFA\n3. **Authorization:** Implement proper access controls\n4. **Encryption:** Use HTTPS and encrypt sensitive data\n5. **Dependencies:** Keep libraries up-to-date\n6. **Error Handling:** Don't expose sensitive info in errors\n7. **Logging:** Monitor and log security events\n8. **Code Review:** Regular security audits\n9. **Testing:** Include security tests in CI/CD\n10. **Training:** Keep team educated on security\n\nFor specific issues in your report, focus on the categories with the most findings.`;
  }
  
  // Fix instructions
  if (lowerMessage.includes("fix") || lowerMessage.includes("how do i")) {
    const topIssues = report.findings.slice(0, 3);
    return `**Top Issues to Fix:**\n\n${topIssues.map((issue, idx) => 
      `**${idx + 1}. ${issue.title}** [${issue.severity.toUpperCase()}]\n${issue.file ? `   File: \`${issue.file}\`\n` : ""}${issue.mitigation ? `   Fix: ${issue.mitigation}\n` : ""}`
    ).join("\n")}\n\n**General Approach:**\n1. Review the code at the identified location\n2. Apply the recommended fix\n3. Test thoroughly\n4. Re-scan to verify the fix\n\nNeed specific code examples? Try asking about a particular vulnerability type (e.g., "How do I fix SQL injection?").`;
  }
  
  // Default response
  return `**Report Summary for ${report.projectName}**\n\n- **Score:** ${report.score}/100 (Grade: ${report.grade})\n- **Total Issues:** ${report.findings.length}\n- **Critical:** ${report.findings.filter(f => f.severity === "critical").length}\n- **High:** ${report.findings.filter(f => f.severity === "high").length}\n- **Medium:** ${report.findings.filter(f => f.severity === "medium").length}\n- **Low:** ${report.findings.filter(f => f.severity === "low").length}\n\n**I can help you with:**\n- Understanding critical issues\n- Fixing specific vulnerability types (SQL injection, XSS, etc.)\n- Explaining security impact\n- Prevention strategies\n- Prioritizing fixes\n\nWhat would you like to know more about?`;
}

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
      
      // Provide helpful fallback response based on the question
      const fallbackResponse = generateFallbackResponse(message, report);
      
      return NextResponse.json(
        {
          response: fallbackResponse,
        },
        { status: 200 }
      );
    }

    // Try multiple models in case one is unavailable
    const modelsToTry = [
      "google/gemini-2.0-flash-exp:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "google/gemma-2-9b-it:free",
    ];

    let lastError: any = null;
    let modelUsed = null;

    // Call OpenRouter API with fallback models
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app",
            "X-Title": "VettCode CLI Security Scanner",
          },
          body: JSON.stringify({
            model: model,
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

        if (response.ok) {
          clearTimeout(timeoutId);
          const data = await response.json();
          const aiResponse =
            data.choices?.[0]?.message?.content ||
            "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

          modelUsed = model;
          console.log(`Success with model: ${model}`);

          return NextResponse.json(
            {
              response: aiResponse,
              model: model,
            } as ChatResponse,
            {
              headers: {
                "X-RateLimit-Limit": RATE_LIMIT.MAX_REQUESTS.toString(),
                "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
              },
            }
          );
        }

        // If not OK, store error and try next model
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          status: response.status,
          model,
          error: errorData,
        };
        console.log(`Model ${model} failed with status ${response.status}`);

        // Don't try other models for auth errors
        if (response.status === 401) {
          break;
        }

        // Continue to next model
      } catch (fetchError: any) {
        lastError = { model, error: fetchError.message };
        console.log(`Model ${model} error:`, fetchError.message);
        
        if (fetchError.name === "AbortError") {
          break;
        }
        // Continue to next model
      }
    }

    // All models failed, use fallback
    clearTimeout(timeoutId);
    console.error("All models failed. Last error:", lastError);
    
    const fallbackResponse = generateFallbackResponse(message, report);
    
    return NextResponse.json(
      {
        response: fallbackResponse,
      } as ChatResponse,
      { status: 200 }
    );
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

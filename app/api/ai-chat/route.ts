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

// Build report context with enhanced file-specific information
function buildReportContext(report: ChatRequest["report"], focusFile?: string): string {
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

  let contextString = `Project: ${report.projectName || "Unknown"}
Score: ${report.score}/100 (Grade: ${report.grade || "N/A"})
Total Findings: ${report.findings.length}
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Low: ${lowCount}

**Top Issues:**
${topIssues || "None"}

**Executive Summary:**
${(report as any).executiveVerdict || "No summary available"}`;

  // Include blueprint context if available
  if ((report as any).blueprint) {
    const blueprint = (report as any).blueprint;
    const meta = blueprint.meta || {};
    
    contextString += `

**Project Architecture (Blueprint):**
- Total Files: ${meta.totalFiles || 0}
- Total Modules: ${meta.totalModules || 0}
- Entry Points: ${meta.entryPoints || 0}
- External Calls: ${meta.externalCalls || 0}`;

    // Add focused file context if specified
    if (focusFile && blueprint) {
      contextString += `

**FOCUSED FILE ANALYSIS: ${focusFile}**`;

      // Find risk information for this file
      const fileRisk = blueprint.riskSurface?.find((r: any) => r.file === focusFile);
      if (fileRisk) {
        contextString += `
- Risk Score: ${fileRisk.score}/100
- Risk Tags: ${fileRisk.tags.join(", ")}
- Risk Reasons: ${fileRisk.reasons.join("; ")}`;
      }

      // Find dependencies (incoming and outgoing)
      const outgoingDeps = blueprint.dependencies?.edges?.filter((e: any) => e.from === focusFile) || [];
      const incomingDeps = blueprint.dependencies?.edges?.filter((e: any) => e.to === focusFile) || [];
      
      if (outgoingDeps.length > 0 || incomingDeps.length > 0) {
        contextString += `

**File Dependencies:**`;
        
        if (outgoingDeps.length > 0) {
          contextString += `
- Imports from: ${outgoingDeps.map((e: any) => e.to).slice(0, 10).join(", ")}`;
        }
        
        if (incomingDeps.length > 0) {
          contextString += `
- Imported by: ${incomingDeps.map((e: any) => e.from).slice(0, 10).join(", ")}`;
        }
      }

      // Find functions in this file
      const fileFunctions = blueprint.functions?.filter((f: any) => f.file === focusFile) || [];
      if (fileFunctions.length > 0) {
        contextString += `
- Functions: ${fileFunctions.slice(0, 15).map((f: any) => `${f.name}(${f.exported ? "exported" : "internal"})`).join(", ")}`;
      }

      // Find external calls from this file
      const fileExternalCalls = blueprint.externalCalls?.filter((c: any) => c.file === focusFile) || [];
      if (fileExternalCalls.length > 0) {
        const callsByType = fileExternalCalls.reduce((acc: any, call: any) => {
          acc[call.type] = (acc[call.type] || 0) + 1;
          return acc;
        }, {});
        contextString += `
- External Calls: ${Object.entries(callsByType).map(([type, count]) => `${count} ${type}`).join(", ")}`;
      }

      // Find call flows involving this file
      const fileFlows = blueprint.flows?.filter((f: any) => f.file === focusFile) || [];
      if (fileFlows.length > 0) {
        contextString += `
- Call Flows: ${fileFlows.length} internal function calls`;
      }

      // Find specific findings for this file
      const fileFindings = report.findings.filter((f: any) => f.file === focusFile);
      if (fileFindings.length > 0) {
        contextString += `

**Vulnerabilities in ${focusFile}:**`;
        fileFindings.slice(0, 10).forEach((finding: any, idx: number) => {
          contextString += `
${idx + 1}. [${finding.severity.toUpperCase()}] ${finding.title}${finding.description ? `: ${finding.description}` : ""}`;
        });
      }
    } else {
      // General blueprint context
      const entryPoints = blueprint.entryPoints?.slice(0, 5) || [];
      const riskSurface = blueprint.riskSurface?.slice(0, 10) || [];
      const hotspots = blueprint.hotspots?.slice(0, 5) || [];
      
      if (entryPoints.length > 0) {
        contextString += `

**Entry Points (Attack Surface):**
${entryPoints.map((ep: any) => `  - ${ep.type}: ${ep.name}${ep.method ? ` [${ep.method}]` : ""} in ${ep.file}`).join("\n")}`;
      }

      if (riskSurface.length > 0) {
        contextString += `

**High-Risk Areas:**
${riskSurface.map((r: any) => `  - ${r.file} (Risk Score: ${r.score}, Tags: ${r.tags.join(", ")})`).join("\n")}`;
      }

      if (hotspots.length > 0) {
        contextString += `

**Hotspots (Highly Connected/Complex):**
${hotspots.map((h: any) => `  - ${h.file} (${h.connections} connections, complexity ${h.complexity})`).join("\n")}`;
      }
    }

    contextString += `

**Context Usage Note:** Use this architectural context to provide more targeted security advice based on how the code is structured, file dependencies, and where the entry points are.`;
  }

  return contextString;
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

    const { message, report, history, model = "auto" } = body;

    // Map AtAI intelligence modes to actual models
    const getModelsForMode = (mode: string): string[] => {
      switch (mode) {
        case "flash":
          return ["ling-3.0-flash:free"];
        case "deep":
          return ["nvidia/nemotron-3-super:free"];
        case "code":
          return ["google/gemma-4-31b-it:free"];
        case "core":
          return ["openai/gpt-oss-20b:free"];
        case "auto":
        default:
          // Auto mode tries all models in priority order
          return [
            "ling-3.0-flash:free",
            "nvidia/nemotron-3-super:free",
            "google/gemma-4-31b-it:free",
            "nvidia/nemotron-3-nano-30b-a3b:free",
            "openai/gpt-oss-20b:free",
          ];
      }
    };

    const modelsToTry = getModelsForMode(model);

    // Extract focused file from message if present
    const focusFileMatch = message.match(/(?:in|for|about)\s+([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)/i);
    const focusFile = focusFileMatch ? focusFileMatch[1] : undefined;

    // Build context with file-specific information if available
    const reportContext = buildReportContext(report, focusFile);

    // Build conversation history (limit to last 8 messages for better context)
    const conversationHistory = history
      .slice(-8)
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
const systemPrompt = `

You are an AI security analyst developed by AtAI (Advanced Technologies and AI Enterprises).

Your role is to analyze security findings and provide direct, accurate, and actionable guidance to developers.

---

## Communication Style

- Be direct, precise, and unambiguous

- Do NOT soften or sugarcoat security risks

- Clearly state potential impact (data loss, breaches, exploitation)

- Remain professional — never emotional or rude

- Be concise but complete

- Use markdown formatting (headings, bullet points, code blocks)

---

## Core Principles

- Security issues must be treated seriously — reflect their real-world consequences

- If a vulnerability is critical, explicitly state that it can lead to severe damage and whatit can cause r result into

- Do NOT downplay risks under any circumstances

- Do NOT invent findings — only use the provided report context

- If information is missing, ask a clarifying question before proceeding

---

## Expertise

- Application security (OWASP Top 10, CWE)

- Secure coding practices

- Vulnerability remediation

- Risk prioritization (severity × exploitability × exposure)

---

## Response Structure (MANDATORY)

For every issue, respond using:

1. **Issue**

   - Clear description of the vulnerability

2. **Impact**

   - What can realistically happen if exploited

   - Be explicit (e.g., data breach, account takeover, remote execution)

3. **Location**

   - Reference the file, function, or report finding

4. **Fix**

   - Concrete steps

   - Include code examples when applicable

5. **Priority**

   - Critical / High / Medium / Low

   - Justify based on impact and exploitability

---

## Behavior Rules

- Prioritize actionable fixes over explanations

- Tie every answer back to the report when possible

- Do not generalize — be specific

- If multiple issues exist, highlight the most dangerous first

- Avoid unnecessary analogies unless they improve clarity

---

## Report Context

${reportContext}

---

Remember:

You are not a general assistant. You are a security analyst.

Your job is to identify risk, explain consequences, and drive immediate action.

`;

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

    let lastError: any = null;
    let modelUsed = null;

    console.log("[AI Chat] Starting request with", modelsToTry.length, "models to try");

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
            temperature: 0.8, // More creative and conversational
            max_tokens: 2000, // Longer, more detailed responses
            top_p: 0.95, // More diverse vocabulary
            frequency_penalty: 0.3, // Reduce repetition
            presence_penalty: 0.3, // Encourage new topics
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          clearTimeout(timeoutId);
          
          // Parse JSON with better error handling
          let data;
          try {
            const responseText = await response.text();
            data = JSON.parse(responseText);
          } catch (parseError: any) {
            console.error(`[AI Chat] Failed to parse response from ${model}:`, parseError.message);
            lastError = { model, error: "JSON parse error", details: parseError.message };
            continue; // Try next model
          }

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
        let errorData;
        try {
          const errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: "Could not parse error response" };
        }
        
        lastError = {
          status: response.status,
          model,
          error: errorData,
        };
        console.log(`[AI Chat] Model ${model} failed with status ${response.status}:`, JSON.stringify(errorData).substring(0, 200));

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
    console.error("[AI Chat] All models failed. Last error:", JSON.stringify(lastError).substring(0, 300));
    console.log("[AI Chat] Using fallback response generator");
    
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

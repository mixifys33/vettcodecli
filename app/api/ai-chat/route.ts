import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai-chat
 * AI assistant for security report analysis using OpenRouter
 */
export async function POST(request: NextRequest) {
  try {
    const { message, report, history } = await request.json();

    if (!message || !report) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // OpenRouter API key (free tier available)
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      // Fallback to mock response for demo
      console.log("No OpenRouter API key found, using mock responses");
      return NextResponse.json({
        response: getMockResponse(message, report),
      });
    }

    // Prepare system context
    const systemPrompt = `You are an expert security analyst helping developers understand and fix vulnerabilities in their code.

Context: You're analyzing a security report for "${report.projectName}" with:
- Score: ${report.score}/100 (${report.grade})
- Total issues: ${report.findings.length}
- Critical: ${report.findings.filter((f: any) => f.severity === "critical").length}
- High: ${report.findings.filter((f: any) => f.severity === "high").length}
- Medium: ${report.findings.filter((f: any) => f.severity === "medium").length}
- Low: ${report.findings.filter((f: any) => f.severity === "low").length}

Provide concise, actionable security advice. Include code examples when relevant. Be friendly but professional. Keep responses under 300 words.`;

    // Build conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-5).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenRouter API with free model
    const openrouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app",
        "X-Title": "VettCode CLI",
      },
      body: JSON.stringify({
        // Free open-source models available on OpenRouter:
        // - "google/gemma-2-9b-it:free" (Fast, good quality)
        // - "meta-llama/llama-3-8b-instruct:free" (Very good)
        // - "mistralai/mistral-7b-instruct:free" (Fast)
        // - "huggingfaceh4/zephyr-7b-beta:free" (Good for code)
        model: "google/gemma-2-9b-it:free", // Using Gemma 2 - excellent free model
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!openrouterResponse.ok) {
      const error = await openrouterResponse.text();
      console.error("OpenRouter API error:", error);
      throw new Error(`OpenRouter API error: ${openrouterResponse.status}`);
    }

    const data = await openrouterResponse.json();
    const response = data.choices[0].message.content;

    return NextResponse.json({ 
      response,
      model: "google/gemma-2-9b-it:free"
    });

  } catch (error) {
    console.error("[AI Chat] Error:", error);
    
    // Fallback to mock response on error
    return NextResponse.json({
      response: getMockResponse(message, report),
      fallback: true,
    });
  }
}

// Mock response for demo/fallback when API is unavailable
function getMockResponse(message: string, report: any): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("critical") || lowerMessage.includes("explain")) {
    const criticalIssues = report.findings.filter((f: any) => f.severity === "critical");
    if (criticalIssues.length > 0) {
      return `🔴 **Critical Issues Found**\n\nI found ${criticalIssues.length} critical issue(s) in your report:\n\n**${criticalIssues[0].title}**\n\n${criticalIssues[0].description}\n\n**💡 Fix:** ${criticalIssues[0].mitigation}\n\n**⚠️ Impact:** This is high priority - it could allow attackers to compromise your application. I recommend addressing this immediately.\n\nWant me to explain how to implement the fix?`;
    }
    return `I found ${report.findings.length} total issues. ${report.findings.filter((f: any) => f.severity === "critical").length} are critical. Would you like me to explain any specific issue?`;
  }

  if (lowerMessage.includes("fix") || lowerMessage.includes("how") || lowerMessage.includes("sql")) {
    return `🔧 **How to Fix Common Vulnerabilities:**\n\n**SQL Injection Prevention:**\n\`\`\`javascript\n// ❌ Vulnerable\nconst query = \`SELECT * FROM users WHERE id = \${userId}\`;\n\n// ✅ Secure - Use parameterized queries\nconst query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [userId]);\n\`\`\`\n\n**General Security Tips:**\n1. Always validate and sanitize user inputs\n2. Use parameterized queries for databases\n3. Escape output before rendering in HTML\n4. Implement strong authentication\n\nNeed help with a specific vulnerability?`;
  }

  if (lowerMessage.includes("impact") || lowerMessage.includes("severity") || lowerMessage.includes("score")) {
    const criticalCount = report.findings.filter((f: any) => f.severity === "critical").length;
    const highCount = report.findings.filter((f: any) => f.severity === "high").length;
    
    return `📊 **Security Assessment**\n\nYour application scored **${report.score}/100** (Grade: ${report.grade})\n\n**Risk Breakdown:**\n🔴 ${criticalCount} Critical - Immediate data breach risk\n🟠 ${highCount} High - Unauthorized access possible\n🟡 ${report.findings.filter((f: any) => f.severity === "medium").length} Medium - Security weaknesses\n⚪ ${report.findings.filter((f: any) => f.severity === "low").length} Low - Minor issues\n\n**Recommendation:** ${criticalCount > 0 ? "Address critical issues immediately!" : "Focus on high severity issues first."} These pose the most immediate risk to your application.\n\nWant a detailed fix plan?`;
  }

  if (lowerMessage.includes("prevent") || lowerMessage.includes("best") || lowerMessage.includes("practice")) {
    return `🛡️ **Security Best Practices**\n\n**Development Phase:**\n✅ Input Validation - Validate ALL user inputs\n✅ Output Encoding - Escape data before display\n✅ Parameterized Queries - Never concatenate SQL\n✅ Authentication - Use secure session management\n\n**Deployment Phase:**\n✅ Security Headers - CSP, HSTS, X-Frame-Options\n✅ HTTPS Only - Encrypt all traffic\n✅ Regular Updates - Keep dependencies current\n\n**Ongoing:**\n✅ Code Reviews - Security-focused reviews\n✅ Automated Scans - Use VettCode in CI/CD\n✅ Team Training - Educate on secure coding\n\nImplementing these will significantly reduce vulnerabilities. Need specific guidance?`;
  }

  if (lowerMessage.includes("xss") || lowerMessage.includes("cross-site")) {
    return `🌐 **XSS Prevention Guide**\n\n**What is XSS?**\nCross-Site Scripting allows attackers to inject malicious scripts into your web pages.\n\n**How to Prevent:**\n\`\`\`javascript\n// ❌ Vulnerable\nelement.innerHTML = userInput;\n\n// ✅ Secure - Escape output\nelement.textContent = userInput;\n// Or use a sanitization library\nconst clean = DOMPurify.sanitize(userInput);\n\`\`\`\n\n**Additional Protection:**\n1. Set Content-Security-Policy headers\n2. Use HTTPOnly cookies\n3. Validate input on server-side\n\nWant more code examples?`;
  }

  // Default response
  return `👋 **I'm here to help!**\n\nI can assist you with the **${report.findings.length} security issues** in your report.\n\n**Ask me about:**\n• "Explain the critical issues"\n• "How do I fix SQL injection?"\n• "What's the security impact?"\n• "Show XSS prevention tips"\n• "Best security practices"\n\n**Quick Stats:**\n- Score: ${report.score}/100 (${report.grade})\n- Project: ${report.projectName}\n\nWhat would you like to know?`;
}

// CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

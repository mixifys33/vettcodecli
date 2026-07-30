import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analyze
 * AI code analysis endpoint - Proxies requests to OpenRouter/Groq
 * This keeps API keys secure on the backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, batchIndex, projectName } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { error: "Invalid message format" },
          { status: 400 }
        );
      }
    }

    // Get API keys from environment (secure server-side)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!openRouterKey && !groqKey) {
      return NextResponse.json(
        { error: "AI services not configured" },
        { status: 503 }
      );
    }

    let result: any = null;
    let provider: 'openrouter' | 'groq' = 'openrouter';

    // Try OpenRouter first
    if (openRouterKey) {
      try {
        result = await callOpenRouter(messages, openRouterKey);
        provider = 'openrouter';
      } catch (error) {
        console.error('[API] OpenRouter failed:', error instanceof Error ? error.message : error);
        // Fall through to Groq
      }
    }

    // Fallback to Groq if OpenRouter failed or not configured
    if (!result && groqKey) {
      try {
        result = await callGroq(messages, groqKey);
        provider = 'groq';
      } catch (error) {
        console.error('[API] Groq failed:', error instanceof Error ? error.message : error);
        return NextResponse.json(
          { error: 'All AI providers failed' },
          { status: 503 }
        );
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'No AI provider available' },
        { status: 503 }
      );
    }

    // Parse the AI response
    const findings = parseAIResponse(result.content);

    return NextResponse.json({
      findings,
      model: result.model,
      provider,
    });

  } catch (error) {
    console.error('[API] Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(messages: any[], apiKey: string) {
  const models = (process.env.OPENROUTER_MODELS || 
    'openrouter/free,deepseek/deepseek-chat-v3-0324:free,qwen/qwen-2.5-coder-32b-instruct:free')
    .split(',')
    .map(m => m.trim())
    .slice(0, 3);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://vettcodecli.vercel.app',
      'X-Title': 'Vettcode Engine',
    },
    body: JSON.stringify({
      models,
      messages,
      temperature: 0.0,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from OpenRouter');
  }

  return {
    content,
    model: data.model || models[0],
  };
}

/**
 * Call Groq API
 */
async function callGroq(messages: any[], apiKey: string) {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.0,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from Groq');
  }

  return {
    content,
    model: data.model || model,
  };
}

/**
 * Parse AI response to extract findings
 */
function parseAIResponse(rawContent: string): any[] {
  try {
    const trimmed = rawContent.trim();
    
    // Remove markdown code blocks
    let cleaned = trimmed.replace(/```(?:json|javascript|js)?\s*/gi, '');
    
    // Extract JSON - find first { or [ to last matching } or ]
    const jsonStart = cleaned.indexOf('{');
    const jsonArrayStart = cleaned.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;
    
    if (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) {
      startIndex = jsonStart;
      let depth = 0;
      for (let i = jsonStart; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        if (cleaned[i] === '}') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    } else if (jsonArrayStart !== -1) {
      startIndex = jsonArrayStart;
      let depth = 0;
      for (let i = jsonArrayStart; i < cleaned.length; i++) {
        if (cleaned[i] === '[') depth++;
        if (cleaned[i] === ']') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('No JSON found in response');
    }
    
    let jsonStr = cleaned.substring(startIndex, endIndex + 1);
    
    // Fix common JSON issues
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
    
    const parsed = JSON.parse(jsonStr);
    
    // Return findings array
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.findings && Array.isArray(parsed.findings)) {
      return parsed.findings;
    }
    
    return [];
    
  } catch (error) {
    console.error('[API] JSON parse error:', error);
    return [];
  }
}

// CORS headers for CLI requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

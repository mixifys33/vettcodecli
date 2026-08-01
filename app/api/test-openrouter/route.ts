import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vettcodecli.vercel.app",
        "X-Title": "VettCode Test",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct:free",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say 'Hello from OpenRouter!' in one sentence." }
        ],
        max_tokens: 50,
      }),
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        success: false,
        status: response.status,
        rawResponse: responseText.substring(0, 500),
        error: "Failed to parse JSON response"
      });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        error: data
      });
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      message: data.choices?.[0]?.message?.content || "No content",
      model: data.model
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'VettCode API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}

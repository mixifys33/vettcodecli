import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    // Cleanup expired sessions first
    await DeviceAuth.cleanupExpired();

    // Create new device auth session
    const session = await DeviceAuth.createSession();

    // Store IP and user agent for security
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    await session.save();

    return NextResponse.json({
      success: true,
      device_code: session.deviceCode,
      user_code: session.userCode,
      verification_url: `${process.env.NEXT_PUBLIC_API_URL || 'https://vettcodecli.vercel.app'}/cli-auth`,
      expires_in: 300, // 5 minutes in seconds
      interval: 5, // Poll every 5 seconds
    });
  } catch (error: any) {
    console.error('[CLI Auth Start] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to start authentication session',
      error: error.message,
    }, { status: 500 });
  }
}

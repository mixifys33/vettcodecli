import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export async function POST(req: NextRequest) {
  try {
    await connectDatabase();

    // Create new device auth session
    const session = await DeviceAuth.createSession();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vettcodecli.vercel.app';

    // Return device code and user code to CLI
    return NextResponse.json({
      success: true,
      deviceCode: session.deviceCode,
      userCode: session.userCode,
      verificationUrl: `${baseUrl}/cli-auth?code=${session.userCode}`,
      expiresIn: 300, // 5 minutes in seconds
      interval: 5, // Poll every 5 seconds
    });
  } catch (error: any) {
    console.error('Device Auth Initiate Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initiate device authentication',
      },
      { status: 500 }
    );
  }
}

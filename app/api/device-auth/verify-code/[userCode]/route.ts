import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: { userCode: string } }
) {
  try {
    await connectDatabase();

    const { userCode } = params;

    const session = await DeviceAuth.findOne({
      userCode: userCode.toUpperCase(),
      status: 'pending',
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired code',
        },
        { status: 404 }
      );
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();

      return NextResponse.json(
        {
          success: false,
          message: 'Code has expired',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    console.error('Device Auth Verify Code Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify code',
      },
      { status: 500 }
    );
  }
}

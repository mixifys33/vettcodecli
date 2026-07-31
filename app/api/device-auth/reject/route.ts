import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export async function POST(req: NextRequest) {
  try {
    await connectDatabase();

    const { userCode } = await req.json();

    if (!userCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'User code is required',
        },
        { status: 400 }
      );
    }

    // Find and reject the session
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

    session.status = 'rejected';
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Device authentication rejected',
    });
  } catch (error: any) {
    console.error('Device Auth Reject Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reject device authentication',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

export async function POST(req: NextRequest) {
  try {
    await connectDatabase();

    const { deviceCode } = await req.json();

    if (!deviceCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Device code is required',
        },
        { status: 400 }
      );
    }

    // Find the device auth session
    const session = await DeviceAuth.findOne({ deviceCode });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid device code',
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
          status: 'expired',
          message: 'Device code has expired. Please try again.',
        },
        { status: 400 }
      );
    }

    // Check status
    if (session.status === 'pending') {
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Waiting for user authentication',
      });
    }

    if (session.status === 'rejected') {
      return NextResponse.json(
        {
          success: false,
          status: 'rejected',
          message: 'Authentication was rejected',
        },
        { status: 403 }
      );
    }

    if (session.status === 'approved') {
      // Get developer info
      const developer = await VettcodeDeveloper.findById(session.developerId);

      if (!developer) {
        return NextResponse.json(
          {
            success: false,
            message: 'Developer not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        status: 'approved',
        token: session.token,
        developer: developer.getPublicProfile(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Unknown session status',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Device Auth Poll Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check authentication status',
      },
      { status: 500 }
    );
  }
}

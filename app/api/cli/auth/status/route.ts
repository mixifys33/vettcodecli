import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const device_code = searchParams.get('device_code');

    if (!device_code) {
      return NextResponse.json({
        success: false,
        message: 'Device code is required',
      }, { status: 400 });
    }

    // Cleanup expired sessions
    await DeviceAuth.cleanupExpired();

    // Find session
    const session = await DeviceAuth.findOne({ deviceCode: device_code })
      .populate('developerId', 'name email profile subscription');

    if (!session) {
      return NextResponse.json({
        success: false,
        status: 'not_found',
        message: 'Invalid device code',
      }, { status: 404 });
    }

    // Check status
    if (session.status === 'expired') {
      return NextResponse.json({
        success: false,
        status: 'expired',
        message: 'Authentication session has expired',
      }, { status: 400 });
    }

    if (session.status === 'rejected') {
      return NextResponse.json({
        success: false,
        status: 'rejected',
        message: 'Authentication was rejected',
      }, { status: 403 });
    }

    if (session.status === 'pending') {
      return NextResponse.json({
        success: true,
        status: 'pending',
        message: 'Waiting for user authorization',
      });
    }

    if (session.status === 'approved') {
      const developer = session.developerId as any;
      return NextResponse.json({
        success: true,
        status: 'approved',
        message: 'Authentication successful',
        token: session.token,
        developer: developer ? {
          id: developer._id,
          name: developer.name,
          email: developer.email,
          profile: developer.profile,
          subscription: developer.subscription,
        } : null,
      });
    }

    // Fallback
    return NextResponse.json({
      success: false,
      status: session.status,
      message: 'Unknown status',
    }, { status: 400 });
  } catch (error: any) {
    console.error('[CLI Auth Status] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check authentication status',
      error: error.message,
    }, { status: 500 });
  }
}

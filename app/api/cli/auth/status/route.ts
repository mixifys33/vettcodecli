import { NextRequest, NextResponse } from 'next/server';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export const dynamic = 'force-dynamic';

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

    console.log(`[CLI Auth Status] Looking for device_code: ${device_code}`);

    // Cleanup expired sessions
    try {
      await DeviceAuth.cleanupExpired();
    } catch (cleanupError: any) {
      console.error('[CLI Auth Status] Cleanup error:', cleanupError?.message);
      // Continue even if cleanup fails
    }

    // Find session
    let session;
    try {
      session = await DeviceAuth.findOne({ deviceCode: device_code })
        .populate('developerId', 'name email profile subscription');
    } catch (findError: any) {
      console.error('[CLI Auth Status] Find error:', findError?.message);
      throw findError;
    }

    if (!session) {
      console.log(`[CLI Auth Status] Session not found for device_code: ${device_code}`);
      return NextResponse.json({
        success: false,
        status: 'not_found',
        message: 'Invalid device code',
      }, { status: 404 });
    }

    console.log(`[CLI Auth Status] Found session with status: ${session.status}`);

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
    console.error('[CLI Auth Status] Error:', error?.message || error);
    console.error('[CLI Auth Status] Full error:', error);
    
    // Check for connection errors
    if (error?.message?.includes('connect ECONNREFUSED') || error?.message?.includes('getaddrinfo')) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed. Please check MongoDB configuration.',
        error: error?.message || 'Unknown database error',
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to check authentication status',
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';

export async function POST(req: NextRequest) {
  try {
    await connectDatabase();

    // Check authorization
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authorized',
        },
        { status: 401 }
      );
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024');
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
        },
        { status: 401 }
      );
    }

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

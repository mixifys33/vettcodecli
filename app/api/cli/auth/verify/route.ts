import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const body = await request.json();
    const { user_code, developer_token } = body;

    if (!user_code) {
      return NextResponse.json({
        success: false,
        message: 'User code is required',
      }, { status: 400 });
    }

    if (!developer_token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    // Verify developer token
    let developerId: string;
    try {
      const decoded = jwt.verify(
        developer_token,
        process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
      ) as { id: string };
      developerId = decoded.id;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Find developer
    const developer = await VettcodeDeveloper.findById(developerId);
    if (!developer) {
      return NextResponse.json({
        success: false,
        message: 'Developer not found',
      }, { status: 404 });
    }

    // Find device auth session by user code
    const session = await DeviceAuth.findOne({
      userCode: user_code.toUpperCase(),
      status: 'pending',
    });

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired user code',
      }, { status: 404 });
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
      return NextResponse.json({
        success: false,
        message: 'User code has expired',
      }, { status: 400 });
    }

    // Generate new token for CLI
    const cliToken = generateToken(developer._id.toString());

    // Approve the session
    session.status = 'approved';
    session.developerId = developer._id as any;
    session.token = cliToken;
    session.approvedAt = new Date();
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Device authorized successfully',
      developer: {
        id: developer._id,
        name: developer.name,
        email: developer.email,
        profile: developer.profile,
        subscription: developer.subscription,
      },
    });
  } catch (error: any) {
    console.error('[CLI Auth Verify] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify user code',
      error: error.message,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';
import connectDatabase from '@/backend/config/database';
import DeviceAuth from '@/backend/models/DeviceAuth';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, secret, { expiresIn } as SignOptions);
};

export async function POST(req: NextRequest) {
  try {
    await connectDatabase();

    const { userCode } = await req.json();
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
    let developerId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024') as { id: string };
      developerId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
        },
        { status: 401 }
      );
    }

    if (!userCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'User code is required',
        },
        { status: 400 }
      );
    }

    // Find the device auth session
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
          message: 'Code has expired. Please try again.',
        },
        { status: 400 }
      );
    }

    // Generate token for CLI
    const cliToken = generateToken(developerId);

    // Update session
    session.status = 'approved';
    session.developerId = developerId as any;
    session.token = cliToken;
    session.approvedAt = new Date();

    await session.save();

    // Get developer info
    const developer = await VettcodeDeveloper.findById(developerId);

    return NextResponse.json({
      success: true,
      message: 'Device authenticated successfully',
      developer: developer?.getPublicProfile(),
    });
  } catch (error: any) {
    console.error('Device Auth Approve Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to approve device authentication',
      },
      { status: 500 }
    );
  }
}

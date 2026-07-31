import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/backend/config/database';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

async function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, developer: null };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
    ) as JwtPayload;

    return { authenticated: true, developer: { id: decoded.id } };
  } catch (error) {
    return { authenticated: false, developer: null };
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verify token
    const authResult = await verifyToken(req);
    if (!authResult.authenticated || !authResult.developer) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find developer with password field
    const developer = await VettcodeDeveloper.findById(authResult.developer.id).select('+password');
    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordCorrect = await developer.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    developer.password = newPassword;
    await developer.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}

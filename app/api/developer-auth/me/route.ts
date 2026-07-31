import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    let decoded: { id: string };
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
      ) as { id: string };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const developer = await VettcodeDeveloper.findById(decoded.id);
    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    if (!developer.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account has been deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      developer: developer.getPublicProfile(),
    });
  } catch (error: any) {
    console.error('[Developer Auth Me] Error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Failed to get developer profile' },
      { status: 500 }
    );
  }
}

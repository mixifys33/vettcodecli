import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';
import { generateToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Find developer and include password
    const developer = await VettcodeDeveloper.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if developer is active
    if (!developer.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordMatch = await developer.comparePassword(password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update login stats
    await developer.updateLoginStats();

    // Generate token
    const token = generateToken(developer._id.toString());

    // Get public profile (without password)
    const profile = developer.getPublicProfile();

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        developer: profile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error during login. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/mongodb';
import VettcodeDeveloper, { IVettcodeDeveloper } from '@/backend/models/VettcodeDeveloper';
import jwt from 'jsonwebtoken';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024',
    { expiresIn: process.env.JWT_EXPIRE || '30d' } as jwt.SignOptions
  );
};

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, message: 'Google credential is required' },
        { status: 400 }
      );
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email not provided by Google' },
        { status: 400 }
      );
    }

    // Check if developer exists
    let developer = await VettcodeDeveloper.findOne({ email: email.toLowerCase() });

    if (developer) {
      // Update login stats
      await developer.updateLoginStats();

      // Update avatar if not set
      if (!developer.profile.avatar && picture) {
        developer.profile.avatar = picture;
        await developer.save();
      }

      // Generate token
      const token = generateToken(developer._id.toString());

      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          token,
          developer: developer.getPublicProfile(),
          isNewUser: false,
        },
        { status: 200 }
      );
    }

    // Create new developer if doesn't exist
    const newDeveloper = await VettcodeDeveloper.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: `google_oauth_${googleId}_${Date.now()}`,
      isEmailVerified: true,
      profile: {
        avatar: picture || null,
      },
    });

    // Generate token
    const token = generateToken(newDeveloper._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        developer: newDeveloper.getPublicProfile(),
        isNewUser: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Google Auth Error:', error);

    if (error.message && error.message.includes('Token used too late')) {
      return NextResponse.json(
        { success: false, message: 'Google token has expired. Please try signing in again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error during Google authentication. Please try again.' },
      { status: 500 }
    );
  }
}

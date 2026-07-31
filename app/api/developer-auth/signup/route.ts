import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VettcodeDeveloper, { IVettcodeDeveloper } from '@/backend/models/VettcodeDeveloper';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

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
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if developer already exists
    const existingDeveloper = await VettcodeDeveloper.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingDeveloper) {
      return NextResponse.json(
        { success: false, message: 'A developer with this email already exists' },
        { status: 400 }
      );
    }

    // Create new developer
    const developer = await VettcodeDeveloper.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(developer._id.toString());

    // Get public profile
    const profile = developer.getPublicProfile();

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        developer: profile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A developer with this email already exists' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error creating account. Please try again.' },
      { status: 500 }
    );
  }
}

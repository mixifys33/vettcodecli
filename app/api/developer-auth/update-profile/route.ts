import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/middleware/authMiddleware';
import connectDB from '@/backend/config/database';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

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
    const { name, profile } = body;

    // Validate name
    if (name && (name.length < 2 || name.length > 100)) {
      return NextResponse.json(
        { success: false, message: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate bio length
    if (profile?.bio && profile.bio.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Bio cannot exceed 500 characters' },
        { status: 400 }
      );
    }

    // Find and update developer
    const developer = await VettcodeDeveloper.findById(authResult.developer.id);
    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (name) developer.name = name;
    if (profile) {
      developer.profile = {
        ...developer.profile,
        bio: profile.bio || developer.profile.bio,
        website: profile.website || developer.profile.website,
        github: profile.github || developer.profile.github,
        linkedin: profile.linkedin || developer.profile.linkedin,
        avatar: developer.profile.avatar, // Preserve existing avatar
      };
    }

    await developer.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      developer: developer.getPublicProfile(),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

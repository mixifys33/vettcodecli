import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import VettcodeDeveloper from '../models/VettcodeDeveloper';

const router = Router();

// Initialize Google OAuth client (only needs Client ID for token verification)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handle OPTIONS preflight requests explicitly
router.options('/verify', (req: Request, res: Response) => {
  res.status(200).end();
});

router.options('/config', (req: Request, res: Response) => {
  res.status(200).end();
});

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/google-auth/verify
// @desc    Verify Google token and login/signup developer
// @access  Public
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google',
      });
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

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        developer: developer.getPublicProfile(),
        isNewUser: false,
      });
    }

    // Create new developer if doesn't exist
    const newDeveloper = await VettcodeDeveloper.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: `google_oauth_${googleId}_${Date.now()}`, // Random password for OAuth users
      isEmailVerified: true, // Google emails are pre-verified
      profile: {
        avatar: picture || null,
      },
    });

    // Generate token
    const token = generateToken(newDeveloper._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      developer: newDeveloper.getPublicProfile(),
      isNewUser: true,
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);

    // Handle specific Google auth errors
    if (error.message && error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired. Please try signing in again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during Google authentication. Please try again.',
    });
  }
});

// @route   GET /api/google-auth/config
// @desc    Get Google OAuth configuration for frontend
// @access  Public
router.get('/config', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID,
  });
});

export default router;

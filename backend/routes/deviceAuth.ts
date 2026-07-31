import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DeviceAuth from '../models/DeviceAuth';
import VettcodeDeveloper from '../models/VettcodeDeveloper';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/device-auth/initiate
// @desc    Initiate device authentication (CLI requests this)
// @access  Public
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    // Create new device auth session
    const session = await DeviceAuth.createSession();

    // Return device code and user code to CLI
    res.status(200).json({
      success: true,
      deviceCode: session.deviceCode,
      userCode: session.userCode,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vettcodecli.vercel.app'}/cli-auth?code=${session.userCode}`,
      expiresIn: 300, // 5 minutes in seconds
      interval: 5, // Poll every 5 seconds
    });
  } catch (error: any) {
    console.error('Device Auth Initiate Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate device authentication',
    });
  }
});

// @route   POST /api/device-auth/poll
// @desc    CLI polls this endpoint to check if user has authenticated
// @access  Public
router.post('/poll', async (req: Request, res: Response) => {
  try {
    const { deviceCode } = req.body;

    if (!deviceCode) {
      return res.status(400).json({
        success: false,
        message: 'Device code is required',
      });
    }

    // Find the device auth session
    const session = await DeviceAuth.findOne({ deviceCode });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid device code',
      });
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        status: 'expired',
        message: 'Device code has expired. Please try again.',
      });
    }

    // Check status
    if (session.status === 'pending') {
      return res.status(200).json({
        success: false,
        status: 'pending',
        message: 'Waiting for user authentication',
      });
    }

    if (session.status === 'rejected') {
      return res.status(403).json({
        success: false,
        status: 'rejected',
        message: 'Authentication was rejected',
      });
    }

    if (session.status === 'approved') {
      // Get developer info
      const developer = await VettcodeDeveloper.findById(session.developerId);

      if (!developer) {
        return res.status(404).json({
          success: false,
          message: 'Developer not found',
        });
      }

      return res.status(200).json({
        success: true,
        status: 'approved',
        token: session.token,
        developer: developer.getPublicProfile(),
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown session status',
    });
  } catch (error: any) {
    console.error('Device Auth Poll Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check authentication status',
    });
  }
});

// @route   POST /api/device-auth/approve
// @desc    User approves device authentication on web (after login)
// @access  Private
router.post('/approve', protect, async (req: Request, res: Response) => {
  try {
    const { userCode } = req.body;
    const developerId = (req as any).developer.id;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    // Find the device auth session
    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase(),
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired code',
      });
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        message: 'Code has expired. Please try again.',
      });
    }

    // Generate token for CLI
    const token = generateToken(developerId);

    // Update session
    session.status = 'approved';
    session.developerId = developerId as any;
    session.token = token;
    session.approvedAt = new Date();
    session.ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    session.userAgent = req.get('user-agent') || 'unknown';
    
    await session.save();

    // Get developer info
    const developer = await VettcodeDeveloper.findById(developerId);

    res.status(200).json({
      success: true,
      message: 'Device authenticated successfully',
      developer: developer?.getPublicProfile(),
    });
  } catch (error: any) {
    console.error('Device Auth Approve Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve device authentication',
    });
  }
});

// @route   POST /api/device-auth/reject
// @desc    User rejects device authentication
// @access  Private
router.post('/reject', protect, async (req: Request, res: Response) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    // Find and reject the session
    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase(),
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired code',
      });
    }

    session.status = 'rejected';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Device authentication rejected',
    });
  } catch (error: any) {
    console.error('Device Auth Reject Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject device authentication',
    });
  }
});

// @route   GET /api/device-auth/verify-code
// @desc    Verify if a user code is valid (for web page)
// @access  Public
router.get('/verify-code/:userCode', async (req: Request, res: Response) => {
  try {
    const { userCode } = req.params;

    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase(),
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired code',
      });
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        message: 'Code has expired',
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    console.error('Device Auth Verify Code Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
    });
  }
});

// Cleanup expired sessions every 5 minutes
setInterval(async () => {
  try {
    await DeviceAuth.cleanupExpired();
  } catch (error) {
    console.error('Failed to cleanup expired device auth sessions:', error);
  }
}, 5 * 60 * 1000);

export default router;

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DeviceAuth from '../models/DeviceAuth';
import VettcodeDeveloper from '../models/VettcodeDeveloper';

const router = express.Router();

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/cli/auth/start
// @desc    Initiate device authorization flow for CLI
// @access  Public
router.post('/start', async (req: Request, res: Response) => {
  try {
    // Cleanup expired sessions first
    await DeviceAuth.cleanupExpired();

    // Create new device auth session
    const session = await DeviceAuth.createSession();

    // Store IP and user agent for security
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    await session.save();

    res.status(200).json({
      success: true,
      device_code: session.deviceCode,
      user_code: session.userCode,
      verification_url: `${process.env.NEXT_PUBLIC_API_URL || 'https://vettcodecli.vercel.app'}/cli-auth`,
      expires_in: 300, // 5 minutes in seconds
      interval: 5, // Poll every 5 seconds
    });
  } catch (error: any) {
    console.error('[CLI Auth Start] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start authentication session',
      error: error.message,
    });
  }
});

// @route   POST /api/cli/auth/verify
// @desc    Verify user code and approve device (called from web browser)
// @access  Private (requires authenticated user)
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { user_code, developer_token } = req.body;

    if (!user_code) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    if (!developer_token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
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
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Find developer
    const developer = await VettcodeDeveloper.findById(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found',
      });
    }

    // Find device auth session by user code
    const session = await DeviceAuth.findOne({
      userCode: user_code.toUpperCase(),
      status: 'pending',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired user code',
      });
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
      return res.status(400).json({
        success: false,
        message: 'User code has expired',
      });
    }

    // Generate new token for CLI
    const cliToken = generateToken(developer._id.toString());

    // Approve the session
    session.status = 'approved';
    session.developerId = developer._id as any;
    session.token = cliToken;
    session.approvedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Device authorized successfully',
      developer: developer.getPublicProfile(),
    });
  } catch (error: any) {
    console.error('[CLI Auth Verify] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user code',
      error: error.message,
    });
  }
});

// @route   GET /api/cli/auth/status
// @desc    Check device authorization status (CLI polling endpoint)
// @access  Public
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { device_code } = req.query;

    if (!device_code || typeof device_code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Device code is required',
      });
    }

    // Cleanup expired sessions
    await DeviceAuth.cleanupExpired();

    // Find session
    const session = await DeviceAuth.findOne({ deviceCode: device_code })
      .populate('developerId', 'name email profile');

    if (!session) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Invalid device code',
      });
    }

    // Check status
    if (session.status === 'expired') {
      return res.status(400).json({
        success: false,
        status: 'expired',
        message: 'Authentication session has expired',
      });
    }

    if (session.status === 'rejected') {
      return res.status(403).json({
        success: false,
        status: 'rejected',
        message: 'Authentication was rejected',
      });
    }

    if (session.status === 'pending') {
      return res.status(200).json({
        success: true,
        status: 'pending',
        message: 'Waiting for user authorization',
      });
    }

    if (session.status === 'approved') {
      return res.status(200).json({
        success: true,
        status: 'approved',
        message: 'Authentication successful',
        token: session.token,
        developer: session.developerId ? (session.developerId as any).getPublicProfile() : null,
      });
    }

    // Fallback
    return res.status(400).json({
      success: false,
      status: session.status,
      message: 'Unknown status',
    });
  } catch (error: any) {
    console.error('[CLI Auth Status] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check authentication status',
      error: error.message,
    });
  }
});

// @route   POST /api/cli/auth/revoke
// @desc    Revoke CLI device authorization
// @access  Private
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    const { device_code, developer_token } = req.body;

    if (!developer_token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
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
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (device_code) {
      // Revoke specific device
      const session = await DeviceAuth.findOne({
        deviceCode: device_code,
        developerId: developerId,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Device not found',
        });
      }

      session.status = 'rejected';
      await session.save();
    } else {
      // Revoke all devices for this developer
      await DeviceAuth.updateMany(
        { developerId: developerId, status: 'approved' },
        { status: 'rejected' }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Device authorization revoked',
    });
  } catch (error: any) {
    console.error('[CLI Auth Revoke] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke authorization',
      error: error.message,
    });
  }
});

// @route   GET /api/cli/auth/devices
// @desc    List all authorized CLI devices
// @access  Private
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);

    // Verify developer token
    let developerId: string;
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
      ) as { id: string };
      developerId = decoded.id;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Find all approved sessions for this developer
    const devices = await DeviceAuth.find({
      developerId: developerId,
      status: 'approved',
    }).sort({ approvedAt: -1 });

    res.status(200).json({
      success: true,
      devices: devices.map((device) => ({
        device_code: device.deviceCode,
        user_code: device.userCode,
        approved_at: device.approvedAt,
        ip_address: device.ipAddress,
        user_agent: device.userAgent,
      })),
    });
  } catch (error: any) {
    console.error('[CLI Auth Devices] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list devices',
      error: error.message,
    });
  }
});

export default router;

const express = require('express');
const DeviceAuth = require('../models/DeviceAuth');
const VettcodeDeveloper = require('../models/VettcodeDeveloper');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/device-auth/request
// @desc    CLI initiates device authorization flow
// @access  Public
router.post('/request', async (req, res) => {
  try {
    // Cleanup expired sessions before creating new one
    await DeviceAuth.cleanupExpired();

    // Create new device auth session
    const session = await DeviceAuth.createSession();

    res.status(200).json({
      success: true,
      deviceCode: session.deviceCode,
      userCode: session.userCode,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cli-auth`,
      expiresIn: 300, // 5 minutes in seconds
      interval: 5, // Poll every 5 seconds
    });
  } catch (error) {
    console.error('Device Auth Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating device authorization',
    });
  }
});

// @route   POST /api/device-auth/poll
// @desc    CLI polls for authorization status
// @access  Public
router.post('/poll', async (req, res) => {
  try {
    const { deviceCode } = req.body;

    if (!deviceCode) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Device code is required',
      });
    }

    // Find device auth session
    const session = await DeviceAuth.findOne({ deviceCode });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'invalid_request',
        message: 'Invalid device code',
      });
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        error: 'expired_token',
        message: 'The device code has expired. Please request a new one.',
      });
    }

    // Check status
    switch (session.status) {
      case 'pending':
        return res.status(400).json({
          success: false,
          error: 'authorization_pending',
          message: 'User has not yet approved the request',
        });

      case 'expired':
        return res.status(400).json({
          success: false,
          error: 'expired_token',
          message: 'The device code has expired',
        });

      case 'rejected':
        return res.status(403).json({
          success: false,
          error: 'access_denied',
          message: 'User denied the authorization request',
        });

      case 'approved':
        // Return token and developer info
        const developer = await VettcodeDeveloper.findById(session.developerId);
        
        if (!developer) {
          return res.status(404).json({
            success: false,
            error: 'invalid_request',
            message: 'Developer not found',
          });
        }

        return res.status(200).json({
          success: true,
          token: session.token,
          developer: developer.getPublicProfile(),
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'invalid_request',
          message: 'Invalid session status',
        });
    }
  } catch (error) {
    console.error('Device Auth Poll Error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Error checking authorization status',
    });
  }
});

// @route   GET /api/device-auth/verify/:userCode
// @desc    Verify user code exists and get session info
// @access  Public
router.get('/verify/:userCode', async (req, res) => {
  try {
    const { userCode } = req.params;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    // Find session by user code
    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase() 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid user code',
      });
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        message: 'This code has expired. Please request a new one from your CLI.',
      });
    }

    // Check if already used
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This code has already been used',
      });
    }

    res.status(200).json({
      success: true,
      userCode: session.userCode,
      expiresAt: session.expiresAt,
      status: session.status,
    });
  } catch (error) {
    console.error('Device Auth Verify Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying user code',
    });
  }
});

// @route   POST /api/device-auth/approve
// @desc    User approves CLI authorization
// @access  Private (requires login)
router.post('/approve', protect, async (req, res) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    // Find session by user code
    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase() 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid user code',
      });
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      await session.save();
      
      return res.status(400).json({
        success: false,
        message: 'This code has expired. Please request a new one from your CLI.',
      });
    }

    // Check if already used
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This code has already been used',
      });
    }

    // Generate token for the user
    const token = generateToken(req.developer.id);

    // Update session
    session.status = 'approved';
    session.developerId = req.developer.id;
    session.token = token;
    session.approvedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'CLI authorization approved successfully',
    });
  } catch (error) {
    console.error('Device Auth Approve Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving authorization',
    });
  }
});

// @route   POST /api/device-auth/reject
// @desc    User rejects CLI authorization
// @access  Private (requires login)
router.post('/reject', protect, async (req, res) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        message: 'User code is required',
      });
    }

    // Find session by user code
    const session = await DeviceAuth.findOne({ 
      userCode: userCode.toUpperCase() 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid user code',
      });
    }

    // Update session
    session.status = 'rejected';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'CLI authorization rejected',
    });
  } catch (error) {
    console.error('Device Auth Reject Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting authorization',
    });
  }
});

module.exports = router;

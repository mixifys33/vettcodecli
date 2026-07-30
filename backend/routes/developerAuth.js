const express = require('express');
const jwt = require('jsonwebtoken');
const VettcodeDeveloper = require('../models/VettcodeDeveloper');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/developer-auth/signup
// @desc    Register a new VettCode developer
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if developer already exists
    const existingDeveloper = await VettcodeDeveloper.findOne({ email: email.toLowerCase() });

    if (existingDeveloper) {
      return res.status(400).json({
        success: false,
        message: 'A developer with this email already exists',
      });
    }

    // Create new developer
    const developer = await VettcodeDeveloper.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(developer._id);

    // Get public profile
    const profile = developer.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      developer: profile,
    });
  } catch (error) {
    console.error('Signup Error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A developer with this email already exists',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating account. Please try again.',
    });
  }
});

// @route   POST /api/developer-auth/login
// @desc    Login VettCode developer
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find developer and include password
    const developer = await VettcodeDeveloper.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!developer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if developer is active
    if (!developer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check password
    const isPasswordMatch = await developer.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update login stats
    await developer.updateLoginStats();

    // Generate token
    const token = generateToken(developer._id);

    // Get public profile (without password)
    const profile = developer.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      developer: profile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login. Please try again.',
    });
  }
});

// @route   GET /api/developer-auth/me
// @desc    Get current logged-in developer
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const developer = await VettcodeDeveloper.findById(req.developer.id);

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found',
      });
    }

    res.status(200).json({
      success: true,
      developer: developer.getPublicProfile(),
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching developer profile',
    });
  }
});

// @route   PUT /api/developer-auth/update-profile
// @desc    Update developer profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, bio, website, github, linkedin } = req.body;

    const updateData = {
      name,
      'profile.bio': bio,
      'profile.website': website,
      'profile.github': github,
      'profile.linkedin': linkedin,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const developer = await VettcodeDeveloper.findByIdAndUpdate(
      req.developer.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      developer: developer.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
});

// @route   POST /api/developer-auth/logout
// @desc    Logout developer (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @route   GET /api/developer-auth/stats
// @desc    Get developer stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const developer = await VettcodeDeveloper.findById(req.developer.id);

    res.status(200).json({
      success: true,
      stats: {
        totalScans: developer.scanStats.totalScans,
        vulnerabilitiesFound: developer.scanStats.vulnerabilitiesFound,
        lastScanDate: developer.scanStats.lastScanDate,
        memberSince: developer.createdAt,
        loginCount: developer.loginCount,
        lastLogin: developer.lastLogin,
        subscription: developer.subscription,
      },
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
    });
  }
});

module.exports = router;

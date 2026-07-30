const jwt = require('jsonwebtoken');
const VettcodeDeveloper = require('../models/VettcodeDeveloper');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024');

      // Get developer from token
      req.developer = await VettcodeDeveloper.findById(decoded.id).select('-password');

      if (!req.developer) {
        return res.status(401).json({
          success: false,
          message: 'Developer not found. Token may be invalid.',
        });
      }

      // Check if developer is active
      if (!req.developer.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.',
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.developer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.developer.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.developer.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024');
        req.developer = await VettcodeDeveloper.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid but continue without auth
        req.developer = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

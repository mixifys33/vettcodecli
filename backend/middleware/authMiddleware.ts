import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import VettcodeDeveloper from '../models/VettcodeDeveloper';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      developer?: any;
    }
  }
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes - verify JWT token
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

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
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.',
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
      ) as JwtPayload;

      // Get developer from token
      req.developer = await VettcodeDeveloper.findById(decoded.id).select('-password');

      if (!req.developer) {
        res.status(401).json({
          success: false,
          message: 'Developer not found. Token may be invalid.',
        });
        return;
      }

      // Check if developer is active
      if (!req.developer.isActive) {
        res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.',
      });
      return;
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
    return;
  }
};

// Authorize specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.developer) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    if (!roles.includes(req.developer.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.developer.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
        ) as JwtPayload;
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

import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024',
    { expiresIn: (process.env.JWT_EXPIRE || '30d') } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
  ) as { id: string };
};

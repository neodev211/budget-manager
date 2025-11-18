import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/supabase';

/**
 * Extended Request type with authenticated user data
 */
export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
  userName?: string;
}

/**
 * Middleware para verificar JWT tokens de Supabase
 * Extrae el token del header Authorization y lo verifica
 * Agrega userId y userEmail al request si es válido
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ✅ Allow CORS preflight OPTIONS requests to pass through
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No authorization token provided',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token with Supabase
    const user = await verifyToken(token);

    if (!user) {
      res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Add user data to request
    const authReq = req as AuthRequest;
    authReq.userId = user.id;
    authReq.userEmail = user.email || '';
    authReq.userName = user.user_metadata?.name || undefined;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication',
      code: 'AUTH_ERROR',
    });
  }
};

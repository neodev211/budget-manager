import rateLimit from 'express-rate-limit';
import { LoggerService } from '../../application/services/LoggerService';

/**
 * Rate Limiting Middleware Configuration
 *
 * Protects the API from DoS attacks and brute force attempts
 * Uses in-memory store (suitable for single instance deployments)
 * For distributed deployments, use Redis store with express-rate-limit-redis
 */

// ✅ General API Rate Limiter
// 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Demasiadas solicitudes desde esta dirección IP, intenta de nuevo más tarde',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
  keyGenerator: (req: any) => {
    // Use X-Forwarded-For header if behind proxy (e.g., nginx, AWS load balancer)
    return (req.ip || req.connection.remoteAddress || req.socket.remoteAddress) as string;
  },
  handler: (req: any, res) => {
    LoggerService.info(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      retryAfter: (req.rateLimit as any)?.resetTime
    });
  }
});

// ✅ Strict Auth Rate Limiter
// 5 failed login attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Demasiados intentos de inicio de sesión fallidos, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req: any) => {
    return (req.ip || req.connection.remoteAddress || req.socket.remoteAddress) as string;
  },
  handler: (req: any, res) => {
    LoggerService.info(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiados intentos de inicio de sesión',
      message: 'Has excedido el límite de intentos. Intenta de nuevo más tarde.',
      retryAfter: (req.rateLimit as any)?.resetTime
    });
  }
});

// ✅ Strict Write Operations Rate Limiter
// 30 write requests per 15 minutes per IP
export const writeOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return (req.ip || req.connection.remoteAddress || req.socket.remoteAddress) as string;
  },
  handler: (req: any, res) => {
    LoggerService.info(`Write operations rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas operaciones de escritura',
      message: 'Has excedido el límite de operaciones. Intenta de nuevo más tarde.',
      retryAfter: (req.rateLimit as any)?.resetTime
    });
  }
});

/**
 * Create a custom rate limiter with specified parameters
 *
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum requests per window
 * @param message - Error message
 */
export function createCustomLimiter(
  windowMs: number,
  max: number,
  message: string
) {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
      return (req.ip || req.connection.remoteAddress || req.socket.remoteAddress) as string;
    },
    handler: (req: any, res) => {
      LoggerService.info(`Custom rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Límite de solicitudes excedido',
        message,
        retryAfter: (req.rateLimit as any)?.resetTime
      });
    }
  });
}

/**
 * Security Notes:
 *
 * 1. In-Memory Store (Current):
 *    - Suitable for single-instance deployments
 *    - Resets on server restart
 *    - Not suitable for clustered deployments
 *
 * 2. For Production Multi-Instance:
 *    - npm install express-rate-limit-redis redis
 *    - Use Redis store for distributed rate limiting
 *
 * 3. IP Detection:
 *    - Currently uses req.ip which respects X-Forwarded-For
 *    - Ensure proxy headers are trusted: app.set('trust proxy', 1)
 *
 * 4. Rate Limit Headers:
 *    - RateLimit-Limit: Total requests allowed
 *    - RateLimit-Remaining: Requests remaining in window
 *    - RateLimit-Reset: Unix timestamp when limit resets
 */

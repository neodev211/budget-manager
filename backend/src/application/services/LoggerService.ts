/**
 * LoggerService
 *
 * Professional logging service with sensitive data sanitization.
 * Uses Winston for production-grade logging with file persistence.
 * Sanitizes PII (Personally Identifiable Information) before logging.
 *
 * ✅ BENEFITS:
 * - Centralized logging with Winston integration
 * - Sensitive data sanitization (emails, tokens, IDs)
 * - Persistent logging to files (error.log, combined.log)
 * - Log level filtering (configurable by NODE_ENV)
 * - Secure audit trail for compliance (GDPR, etc.)
 */

import winston from 'winston';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Sanitization utilities for PII and sensitive data
 */
class SanitizationUtil {
  /**
   * Hash/mask a user ID for safe logging
   */
  static maskUserId(userId: string): string {
    if (!userId) return '[NO_ID]';
    return userId.substring(0, 4) + '...' + userId.substring(userId.length - 4);
  }

  /**
   * Mask an email address for safe logging
   */
  static maskEmail(email: string): string {
    if (!email) return '[NO_EMAIL]';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.substring(0, 2) + '***' + local.substring(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask a token for safe logging
   */
  static maskToken(token: string): string {
    if (!token) return '[NO_TOKEN]';
    if (token.length < 20) return '[TOKEN]';
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
  }

  /**
   * Recursively sanitize object to remove sensitive fields
   */
  static sanitizeObject(obj: any, depth = 0): any {
    if (depth > 5) return '[CIRCULAR]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'secret', 'key', 'apiKey', 'authToken'];

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

/**
 * Winston logger instance
 */
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'budget-manager-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export class LoggerService {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private static isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log debug message (only in development)
   */
  static debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeMeta(meta);
      winstonLogger.debug(message, { ...sanitized });
    }
  }

  /**
   * Log info message
   */
  static info(message: string, meta?: any): void {
    const sanitized = this.sanitizeMeta(meta);
    winstonLogger.info(message, { ...sanitized });
  }

  /**
   * Log warning message
   */
  static warn(message: string, meta?: any): void {
    const sanitized = this.sanitizeMeta(meta);
    winstonLogger.warn(message, { ...sanitized });
  }

  /**
   * Log error message with stack trace
   */
  static error(message: string, error?: Error | any, meta?: any): void {
    const sanitized = this.sanitizeMeta(meta);
    const errorObj = error instanceof Error ? { stack: error.stack, message: error.message } : error;
    const sanitizedError = this.sanitizeMeta(errorObj);
    winstonLogger.error(message, { error: sanitizedError, ...sanitized });
  }

  /**
   * Log server startup
   */
  static startup(message: string): void {
    winstonLogger.info(`[STARTUP] ${message}`);
  }

  /**
   * Log database event
   */
  static database(message: string, duration?: number): void {
    const level = duration && duration > 200 ? 'warn' : 'debug';
    const durationMeta = duration ? { duration: `${duration}ms` } : {};
    winstonLogger.log(level, `[DATABASE] ${message}`, durationMeta);
  }

  /**
   * Log security event (always logged regardless of level)
   */
  static security(message: string, meta?: any): void {
    const sanitized = this.sanitizeMeta(meta);
    winstonLogger.warn(`[SECURITY] ${message}`, { ...sanitized });
  }

  /**
   * Sanitize user-related metadata before logging
   */
  private static sanitizeMeta(meta?: any): any {
    if (!meta) return {};

    // Sanitize email if present in message context
    let sanitized = { ...meta };

    // Sanitize common user fields
    if (sanitized.email) {
      sanitized.email = SanitizationUtil.maskEmail(sanitized.email);
    }
    if (sanitized.userId) {
      sanitized.userId = SanitizationUtil.maskUserId(sanitized.userId);
    }
    if (sanitized.token) {
      sanitized.token = SanitizationUtil.maskToken(sanitized.token);
    }

    // Deep sanitize object for sensitive fields
    sanitized = SanitizationUtil.sanitizeObject(sanitized);

    return sanitized;
  }
}

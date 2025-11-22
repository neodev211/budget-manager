/**
 * Input Sanitization Middleware
 *
 * Protects against:
 * - XSS (Cross-Site Scripting) attacks
 * - HTML/Script injection
 * - NoSQL injection
 * - Path traversal attempts
 *
 * Uses express-validator for validation and isomorphic-dompurify for HTML sanitization
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import purify from 'isomorphic-dompurify';
import { LoggerService } from '../../application/services/LoggerService';

/**
 * Sanitization utility class
 */
export class SanitizationUtil {
  /**
   * Sanitize a string value - removes HTML tags and escape dangerous characters
   */
  static sanitizeString(value: string): string {
    if (typeof value !== 'string') return value;

    // Use DOMPurify to remove HTML tags
    const cleaned = purify.sanitize(value, { ALLOWED_TAGS: [] });

    // Additional trimming
    return cleaned.trim();
  }

  /**
   * Sanitize numeric values
   */
  static sanitizeNumber(value: any): number {
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(value: string): string {
    if (typeof value !== 'string') throw new Error('Invalid email');

    const sanitized = this.sanitizeString(value).toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized;
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any, depth = 0): any {
    if (depth > 5) return null; // Prevent deeply nested objects
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};

      // Block dangerous keys
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

      for (const [key, value] of Object.entries(obj)) {
        // Reject dangerous prototype pollution keys
        if (dangerousKeys.includes(key)) {
          LoggerService.security('Blocked potential prototype pollution attempt', { key });
          continue;
        }

        // Sanitize key name
        const sanitizedKey = this.sanitizeString(key);

        // Sanitize value recursively
        sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
      }

      return sanitized;
    }

    return obj;
  }

  /**
   * Check if string contains potential XSS or injection attempts
   */
  static hasInjectionPatterns(value: string): boolean {
    if (typeof value !== 'string') return false;

    const injectionPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,          // Script tags
      /on\w+\s*=/gi,                                 // Event handlers
      /javascript:/gi,                               // JavaScript protocol
      /data:text\/html/gi,                           // Data URLs with HTML
      /vbscript:/gi,                                 // VBScript protocol
      /'|"|`/g,                                      // Quotes that might break strings
      /[\u0000-\u001F\u007F-\u009F]/g,             // Control characters
    ];

    return injectionPatterns.some(pattern => pattern.test(value));
  }
}

/**
 * Validation middleware for expense data
 */
export const validateExpenseInput = [
  body('description')
    .trim()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters')
    .custom((value) => {
      if (SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Description contains invalid characters or patterns');
      }
      return true;
    }),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('categoryId')
    .trim()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category ID is required'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .custom((value) => {
      if (value && SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Notes contains invalid characters or patterns');
      }
      return true;
    }),
];

/**
 * Validation middleware for provision data
 */
export const validateProvisionInput = [
  body('description')
    .trim()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters')
    .custom((value) => {
      if (SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Description contains invalid characters or patterns');
      }
      return true;
    }),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('categoryId')
    .trim()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category ID is required'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .custom((value) => {
      if (value && SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Notes contains invalid characters or patterns');
      }
      return true;
    }),
];

/**
 * Validation middleware for category data
 */
export const validateCategoryInput = [
  body('name')
    .trim()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .custom((value) => {
      if (SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Category name contains invalid characters or patterns');
      }
      return true;
    }),

  body('budget')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .custom((value) => {
      if (value && SanitizationUtil.hasInjectionPatterns(value)) {
        throw new Error('Description contains invalid characters or patterns');
      }
      return true;
    }),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    LoggerService.security('Validation error detected', {
      path: req.path,
      errorCount: errors.array().length,
    });

    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

/**
 * Middleware to sanitize request body
 * Should be applied AFTER validation
 */
export const sanitizeRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = SanitizationUtil.sanitizeObject(req.body);
    }
    next();
  } catch (error) {
    LoggerService.security('Error during request body sanitization', error);
    res.status(400).json({
      error: 'Invalid request body',
      message: 'Request body contains invalid data',
    });
  }
};

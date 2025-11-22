/**
 * LoggerService
 *
 * Simple centralized logging service for consistent log output.
 * Supports different log levels: debug, info, warn, error
 * Can be extended later to use Winston, Pino, or other professional loggers
 *
 * ✅ BENEFITS:
 * - Centralized logging for easier debugging
 * - Log level filtering (configurable by NODE_ENV)
 * - Consistent log format across the application
 * - Easy to extend for production logging tools
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class LoggerService {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private static isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log debug message (only in development)
   */
  static debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.log(`[${this.timestamp()}] 🔍 DEBUG: ${message}`, meta ? `| ${JSON.stringify(meta)}` : '');
    }
  }

  /**
   * Log info message
   */
  static info(message: string, meta?: any): void {
    console.log(`[${this.timestamp()}] ℹ️  INFO: ${message}`, meta ? `| ${JSON.stringify(meta)}` : '');
  }

  /**
   * Log warning message
   */
  static warn(message: string, meta?: any): void {
    console.warn(`[${this.timestamp()}] ⚠️  WARN: ${message}`, meta ? `| ${JSON.stringify(meta)}` : '');
  }

  /**
   * Log error message with stack trace
   */
  static error(message: string, error?: Error | any, meta?: any): void {
    console.error(`[${this.timestamp()}] ❌ ERROR: ${message}`);
    if (error instanceof Error) {
      console.error(`   Stack: ${error.stack}`);
    } else if (error) {
      console.error(`   Details: ${JSON.stringify(error)}`);
    }
    if (meta) {
      console.error(`   Meta: ${JSON.stringify(meta)}`);
    }
  }

  /**
   * Log server startup
   */
  static startup(message: string): void {
    console.log(`[${this.timestamp()}] 🚀 STARTUP: ${message}`);
  }

  /**
   * Log database event
   */
  static database(message: string, duration?: number): void {
    const durationStr = duration ? ` (${duration}ms)` : '';
    if (duration && duration > 200) {
      console.warn(`[${this.timestamp()}] ⏱️  SLOW QUERY: ${message}${durationStr}`);
    } else if (this.isDevelopment) {
      console.log(`[${this.timestamp()}] 📊 DB: ${message}${durationStr}`);
    }
  }

  /**
   * Log security event
   */
  static security(message: string, meta?: any): void {
    console.warn(`[${this.timestamp()}] 🔐 SECURITY: ${message}`, meta ? `| ${JSON.stringify(meta)}` : '');
  }

  /**
   * Format current timestamp
   */
  private static timestamp(): string {
    return new Date().toISOString();
  }
}

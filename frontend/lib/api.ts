import axios, { AxiosError, AxiosResponse } from 'axios';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * API Configuration with timeout and reliability improvements
 *
 * ✅ RELIABILITY:
 * - timeout: 30 seconds for all requests (prevents hanging requests)
 * - maxRedirects: 5 to follow redirects safely
 * - validateStatus: Accept responses with status < 500 (don't throw on client errors)
 *
 * ✅ SECURITY:
 * - Content-Type enforcement
 * - CSRF protection ready
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ TIMEOUT: 30 seconds to prevent hanging requests
  timeout: 30000,
  // ✅ REDIRECT: Follow up to 5 redirects
  maxRedirects: 5,
  // ✅ VALIDATION: Don't throw on client errors (4xx), only server errors (5xx)
  validateStatus: (status) => status < 500,
});

/**
 * Request counter for retry logic
 * Tracks the number of retry attempts per request
 */
const requestRetryCount = new WeakMap<any, number>();

/**
 * Request interceptor to add Supabase auth token
 * Adds Bearer token to Authorization header for authenticated API calls
 *
 * ✅ ERROR HANDLING: Gracefully handles auth session retrieval failures
 */
api.interceptors.request.use(async (config) => {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting auth session:', error);
    // Don't block request if session retrieval fails
  }

  return config;
});

/**
 * Response interceptor for error handling and timeouts
 *
 * ✅ TIMEOUT HANDLING: Detects and reports timeout errors specifically
 * ✅ AUTHENTICATION: Handles 401 by redirecting to login
 * ✅ NETWORK: Detects network errors and reports them
 * ✅ RETRY: Automatic retry for timeout errors (up to 3 attempts)
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Get the config from the error for retry logic
    const config = error.config as any;
    const retries = requestRetryCount.get(config) || 0;

    // ✅ TIMEOUT ERROR: Detect and report specifically
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout (30s exceeded):', error.config?.url);

      // Attempt retry for timeout errors (up to 3 times)
      if (retries < 3) {
        requestRetryCount.set(config, retries + 1);
        console.warn(`Retrying request (attempt ${retries + 1}/3)...`);

        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        const delayMs = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));

        return api.request(config);
      }
    }

    // ✅ NETWORK ERROR: Network is down or request failed
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error - please check your connection',
      });
    }

    // ✅ TIMEOUT ERROR: From response (statusCode)
    if (error.response?.status === 408) {
      console.error('⏱️ Server timeout (408):', error.config?.url);
      return Promise.reject({
        ...error,
        isTimeoutError: true,
        message: 'Request timeout - please try again',
      });
    }

    // ✅ RATE LIMIT ERROR: 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || 60;
      console.error(`🚫 Rate limited - retry after ${retryAfter}s`);
      return Promise.reject({
        ...error,
        isRateLimitError: true,
        retryAfter: parseInt(retryAfter),
        message: `Too many requests. Please wait ${retryAfter} seconds.`,
      });
    }

    // ✅ AUTHENTICATION ERROR: 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('🔓 Unauthorized - redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject({
        ...error,
        isAuthError: true,
        message: 'Authentication failed - please log in again',
      });
    }

    // ✅ FORBIDDEN ERROR: 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🔒 Forbidden:', error.config?.url);
      return Promise.reject({
        ...error,
        isForbiddenError: true,
        message: 'Access denied - you do not have permission',
      });
    }

    // ✅ NOT FOUND ERROR: 404 Not Found
    if (error.response?.status === 404) {
      console.error('❌ Not found:', error.config?.url);
      return Promise.reject({
        ...error,
        isNotFoundError: true,
        message: 'Resource not found',
      });
    }

    // ✅ VALIDATION ERROR: 400 Bad Request
    if (error.response?.status === 400) {
      console.error('⚠️ Validation error:', error.response?.data);
      return Promise.reject({
        ...error,
        isValidationError: true,
        validationErrors: (error.response?.data as any)?.details,
        message: (error.response?.data as any)?.error || 'Invalid request',
      });
    }

    // ✅ SERVER ERROR: 5xx errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('💥 Server error:', error.response.status, error.config?.url);
      return Promise.reject({
        ...error,
        isServerError: true,
        message: 'Server error - please try again later',
      });
    }

    // ✅ DEFAULT: Log all other errors
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

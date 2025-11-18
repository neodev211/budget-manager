import axios from 'axios';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add Supabase auth token
 * Adds Bearer token to Authorization header for authenticated API calls
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
  }

  return config;
});

/**
 * Response interceptor for logging (development)
 * Also handles token refresh on 401 responses
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

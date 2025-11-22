/**
 * Version Management
 *
 * This file contains version and release information.
 * Update this file when releasing new versions to track changes.
 */

export const VERSION_INFO = {
  version: '2.0.0',
  release: '2025.11.20.004',
  releaseDate: '2025-11-20',
  changelog: [
    {
      version: '2.0.0',
      release: '2025.11.20.004',
      date: '2025-11-20',
      changes: [
        'Sync: Frontend aligned with backend v2.0.0 - Database optimization release',
        'Backend: Migrated usedAmount to materialized column for ~90% query reduction',
        'Backend: Eliminated N+1 queries in provision operations via transactional updates',
        'Backend: Removed *WithUsedAmount methods, simplified repository interface',
        'No frontend code changes - Compatible with backend optimization',
      ],
    },
    {
      version: '1.1.2',
      release: '2025.11.20.003',
      date: '2025-11-20',
      changes: [
        'Fix: Added fallback redirect mechanism using window.location.href',
        'Diagnosis: router.push executes but page navigation may not complete in some cases',
        'Solution: After 500ms router.push, wait 1s and check if still on /login, then use window.location',
        'Result: Guarantees redirect to dashboard even if Next.js router fails to navigate',
      ],
    },
    {
      version: '1.1.1',
      release: '2025.11.20.002',
      date: '2025-11-20',
      changes: [
        'Fix: Login redirect issue - removed isRedirecting state that was canceling setTimeout',
        'Root cause: State change in dependency array was triggering effect cleanup before timer could execute',
        'Solution: Simplified to only check !loading && user, preventing timer cancellation',
        'Result: Redirect now properly executes after 500ms delay once user is authenticated',
      ],
    },
    {
      version: '1.1.0',
      release: '2025.11.20.001',
      date: '2025-11-20',
      changes: [
        'Fix: Redirect not working after login - root cause identified',
        'Solution: Added isRedirecting flag to prevent duplicate router.push calls',
        'Added 500ms delay to ensure session is fully established before redirect',
        'Removed duplicate redirect logic from SIGNED_IN event handler',
      ],
    },
    {
      version: '1.0.9',
      release: '2025.11.19.005',
      date: '2025-11-19',
      changes: [
        'Debug: Add detailed logging to authentication flow to identify redirect issue after login',
        'Logging added to AuthContext, LoginPage, and onAuthStateChange callbacks',
      ],
    },
    {
      version: '1.0.8',
      release: '2025.11.19.004',
      date: '2025-11-19',
      changes: [
        'Fix: Hide logout button on login page when session is not initialized',
      ],
    },
    {
      version: '1.0.7',
      release: '2025.11.19.003',
      date: '2025-11-19',
      changes: [
        'Fix: Return usedAmount as positive number in provision calculations',
      ],
    },
    {
      version: '1.0.6',
      release: '2025.11.19.002',
      date: '2025-11-19',
      changes: [
        'Fix: Remove duplicate version display from login page',
        'Fix: Hide logout button on login page when no session exists',
        'Fix: Resolve login redirect issue by listening to SIGNED_IN auth event',
        'Fix: Calculate provision remaining balance (amount - expenses) instead of full amount',
      ],
    },
    {
      version: '1.0.5',
      release: '2025.11.19.001',
      date: '2025-11-19',
      changes: [
        'Fix: Auto-calculate usedAmount for provisions on retrieval',
        'Fix: Resolve login loop and improve toast notification reliability',
        'Feature: Add version tracking system for release identification',
      ],
    },
    {
      version: '1.0.4',
      release: '2025.11.19.000',
      date: '2025-11-19',
      changes: [
        'Feature: Complete toast notification implementation in expenses page',
        'Feature: Add toast notification system for better UX feedback',
      ],
    },
    {
      version: '1.0.3',
      release: '2025.11.18.000',
      date: '2025-11-18',
      changes: [
        'Feature: Improve login UX with error messages and signup option',
        'Fix: Auto-provision users in database on first authentication',
        'Fix: CORS configuration',
      ],
    },
  ],
};

/**
 * Get current version string
 * @returns Version in format "v1.0.5 (2025.11.19.001)"
 */
export const getCurrentVersion = (): string => {
  return `v${VERSION_INFO.version} (${VERSION_INFO.release})`;
};

/**
 * Get current release date
 * @returns Release date in ISO format
 */
export const getReleaseDate = (): string => {
  return VERSION_INFO.releaseDate;
};

/**
 * Get latest changelog entry
 * @returns Latest release changelog
 */
export const getLatestChangelog = () => {
  return VERSION_INFO.changelog[0];
};

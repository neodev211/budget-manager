/**
 * Version Management
 *
 * This file contains version and release information.
 * Update this file when releasing new versions to track changes.
 */

export const VERSION_INFO = {
  version: '2.0.12',
  release: '2025.11.22.012',
  releaseDate: '2025-11-22',
  changelog: [
    {
      version: '2.0.12',
      release: '2025.11.22.012',
      date: '2025-11-22',
      changes: [
        'Reliability: Added 30-second timeout to all API requests',
        'Reliability: Prevents hanging requests and improves UX',
        'Reliability: Automatic retry for timeout errors (up to 3 attempts with exponential backoff)',
        'Reliability: Redirect following limited to 5 hops to prevent redirect loops',
        'Error Handling: Specific error types for different failure scenarios',
        'Error Handling: ECONNABORTED detection for timeout errors',
        'Error Handling: Network error detection with clear messaging',
        'Error Handling: Rate limit error (429) detection with retry-after header support',
        'Error Handling: Authentication error (401) with automatic login redirect',
        'Error Handling: Forbidden (403), Not Found (404), Validation (400) error handling',
        'Error Handling: Server error (5xx) detection and reporting',
        'Error Handling: Structured error objects with specific flags (isTimeoutError, isNetworkError, etc.)',
        'Logging: Emoji-prefixed error messages for quick visual identification',
        'Logging: Request timeout logs show URL and retry attempts',
        'Logging: Network errors logged with connection details',
        'Improvement: validateStatus function allows 4xx errors without throwing',
        'Improvement: Graceful auth session retrieval failure handling',
        'Security: Content-Type enforcement on all requests',
        'UX: Users see specific error messages (timeout, network, rate limit, auth)',
        'Memory: WeakMap for tracking retries prevents memory leaks',
      ],
    },
    {
      version: '2.0.11',
      release: '2025.11.22.011',
      date: '2025-11-22',
      changes: [
        'Security: Implemented comprehensive input validation and sanitization',
        'Security: Integrated express-validator for schema-based input validation',
        'Security: Added isomorphic-dompurify for HTML tag removal and XSS prevention',
        'Security: Created sanitization middleware for all API endpoints',
        'Security: Validates and sanitizes expense data (description, amount, notes)',
        'Security: Validates and sanitizes provision data (description, amount, notes)',
        'Security: Validates and sanitizes category data (name, budget, description)',
        'Security: Detects and blocks XSS injection patterns (<script>, event handlers, etc.)',
        'Security: Protects against NoSQL injection with field validation',
        'Security: Prevents prototype pollution attacks (__proto__, constructor, prototype)',
        'Security: Sanitizes input recursively for nested objects and arrays',
        'Security: Applied validation to all POST and PUT operations on /api/categories, /api/provisions, /api/expenses',
        'Security: Blocks dangerous control characters and suspicious patterns',
        'Validation: Length constraints on all string fields (descriptions max 500-1000 chars)',
        'Validation: Amount fields require positive numbers',
        'Validation: Date fields validated as ISO 8601 format',
        'Validation: Custom error responses for validation failures',
        'Infrastructure: Validation errors logged as security events',
        'Improvement: Centralized SanitizationUtil class for reusable sanitization logic',
        'Documentation: Comprehensive Javadoc comments for all sanitization functions',
      ],
    },
    {
      version: '2.0.10',
      release: '2025.11.22.010',
      date: '2025-11-22',
      changes: [
        'Security: Implemented Winston professional logging with persistent file storage',
        'Security: Added PII sanitization to prevent exposure of sensitive data in logs',
        'Security: Email addresses masked as m***o@domain.com in logs',
        'Security: User IDs masked as xxxx...xxxx (first 4 + last 4 characters)',
        'Security: Tokens masked to show only first 10 and last 10 characters',
        'Security: Automatic redaction of password, token, authorization, cookie, secret fields',
        'Security: Removed plain text email logging from user provisioning (auth middleware)',
        'Infrastructure: Winston logger writes to logs/error.log (errors) and logs/combined.log (all events)',
        'Infrastructure: Log rotation with 10MB max file size and 5 file retention',
        'Infrastructure: Console output in development, file-only in production',
        'Improvement: Recursive deep sanitization of nested objects and arrays',
        'Improvement: Separate error and combined log files for easier debugging',
        'Compliance: GDPR-compliant logging without exposing user email addresses',
        'Documentation: Security audit trail maintained for compliance verification',
      ],
    },
    {
      version: '2.0.9',
      release: '2025.11.22.009',
      date: '2025-11-22',
      changes: [
        'Security: Implemented Helmet.js for comprehensive HTTP security headers',
        'Security: Added Content-Security-Policy (CSP) with safe directives',
        'Security: Configured strict HSTS (HTTP Strict Transport Security) with 1-year max age',
        'Security: Enabled clickjacking protection via X-Frame-Options: DENY',
        'Security: Prevented MIME-type sniffing with X-Content-Type-Options: nosniff',
        'Security: Added XSS protection header (X-XSS-Protection)',
        'Security: Configured CSP to allow self-hosted scripts and styles with unsafe-inline for existing frontend compatibility',
        'Infrastructure: Helmet.js installed and integrated before CORS and other middleware',
        'Documentation: Security headers protect against clickjacking, XSS, MIME sniffing attacks',
      ],
    },
    {
      version: '2.0.8',
      release: '2025.11.22.008',
      date: '2025-11-22',
      changes: [
        'Security: Implemented comprehensive rate limiting to prevent DoS and brute force attacks',
        'Security: Added express-rate-limit middleware with configurable limits',
        'Security: General API rate limit: 100 requests per 15 minutes per IP',
        'Security: Strict write operations limit: 30 requests per 15 minutes per IP',
        'Security: Auth rate limiter: 5 failed attempts per 15 minutes per IP',
        'Security: Proper IP detection with X-Forwarded-For header support',
        'Security: Rate limit headers in HTTP responses (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)',
        'Improvement: Trust proxy configuration for accurate IP detection behind load balancers',
        'Improvement: Automatic logging of rate limit violations',
        'Improvement: Spanish-language error messages for rate limit responses',
        'Infrastructure: Rate limiting suitable for single-instance deployments',
        'Documentation: Security notes on upgrading to Redis for distributed deployments',
      ],
    },
    {
      version: '2.0.7',
      release: '2025.11.22.007',
      date: '2025-11-22',
      changes: [
        'Feature: FormPreview component showing real-time budget impact visualization',
        'Feature: BudgetBar component with color-coded status (green/yellow/red)',
        'Feature: Before/After budget comparison in form preview',
        'Feature: Detailed warnings for budget concerns (exceed, low balance)',
        'Feature: Visual trend indicators showing increase/decrease in spending',
        'Improvement: Expenses page now shows category budget impact preview',
        'Improvement: Provisions page now shows category reservation impact preview',
        'Improvement: Smart warnings about budget constraints before submission',
        'Improvement: Animated budget bar with smooth transitions',
        'UX: Users can now anticipate the impact of their actions before confirming',
        'UX: Color-coded feedback makes budget status immediately clear',
        'Accessibility: Budget bars with proper ARIA attributes for screen readers',
      ],
    },
    {
      version: '2.0.6',
      release: '2025.11.22.006',
      date: '2025-11-22',
      changes: [
        'Feature: Persistent filters with localStorage and URL synchronization',
        'Feature: Created useFilterState custom hook for managing filter state across pages',
        'Feature: Filters now persist when navigating away and returning to the page',
        'Feature: Shareable filter configurations via URL parameters',
        'Feature: Favorite filters management (save, load, delete filter presets)',
        'Improvement: Expenses, Categories, and Provisions pages now use centralized filter management',
        'Improvement: Reduced boilerplate code - replaced 6 useState declarations with single hook call per page',
        'Improvement: Filter state synchronization with URL search parameters for shareable configurations',
        'UX: Users no longer lose filter selections when navigating between pages',
        'UX: Filter preferences are restored automatically on page reload',
      ],
    },
    {
      version: '2.0.5',
      release: '2025.11.22.005',
      date: '2025-11-22',
      changes: [
        'Fix: Corrected modifier key logic in useKeyboardShortcuts - now properly prevents browser defaults (Ctrl+N, Ctrl+S, etc.)',
        'Fix: preventDefault now correctly fires for all keyboard shortcuts with modifier keys',
        'Improvement: CommandPalette now shows helpful tip on first open: "Escribe para filtrar comandos..."',
        'Improvement: Better Spanish localization - placeholder text and footer instructions now in Spanish',
        'Improvement: Clear visual instructions for keyboard navigation (↑↓ Navegar, ↵ Seleccionar, ESC Cerrar)',
        'UX: CommandPalette is now more intuitive for new users with explicit instructions to type',
      ],
    },
    {
      version: '2.0.4',
      release: '2025.11.22.004',
      date: '2025-11-22',
      changes: [
        'Feature: Comprehensive keyboard shortcuts system with useKeyboardShortcuts hook',
        'Feature: CommandPalette component for quick access to actions (Ctrl+K)',
        'Feature: Page-specific shortcuts (Ctrl+N create, Ctrl+S save, Escape cancel)',
        'Feature: Command palette with searchable actions and categories',
        'Improvement: Smart focus management - focus shifts to relevant inputs',
        'Improvement: Keyboard navigation in command palette (Arrow keys, Enter)',
        'Improvement: Visual keyboard shortcut indicators throughout the app',
        'Accessibility: Full keyboard navigation without requiring mouse',
        'UX: Power users can now work entirely with keyboard shortcuts',
      ],
    },
    {
      version: '2.0.3',
      release: '2025.11.22.003',
      date: '2025-11-22',
      changes: [
        'Feature: Granular loading states for all operations (create, update, delete)',
        'Feature: SkeletonLoader component for better visual feedback during data loading',
        'Improvement: Replaced global loading state with specific operation states',
        'Improvement: Skeleton loaders for tables and cards show placeholder during fetch',
        'Improvement: Individual delete button loading indicators (⏳ icon)',
        'Improvement: Form buttons show "Procesando..." state during submission',
        'UX: Users now see what\'s loading and can interact with other parts of the page',
      ],
    },
    {
      version: '2.0.2',
      release: '2025.11.22.002',
      date: '2025-11-22',
      changes: [
        'Feature: Custom confirmation modal component for all delete operations',
        'Improvement: Replaced window.confirm() with styled ConfirmationModal',
        'Improvement: Consistent delete confirmation across expenses, categories, and provisions pages',
        'Improvement: Better mobile UX - Modal is fully styleable and accessible',
        'Improvement: Keyboard navigation support - Press Escape to cancel',
        'UI: Clear danger state styling with red buttons for delete actions',
      ],
    },
    {
      version: '2.0.1',
      release: '2025.11.22.001',
      date: '2025-11-22',
      changes: [
        'Fix: Provisions page - Total open provisions now shows sum of remaining balance (saldo) instead of full amount',
        'Fix: Categories page - Available budget now correctly calculated as: presupuesto - saldo_provisiones - gastado',
        'Improvement: Both calculations now properly account for expenses linked to provisions',
        'Note: saldo (remaining balance) = provisioned amount - linked expenses',
      ],
    },
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

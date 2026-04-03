/**
 * Centralized configuration for the storefront.
 * Avoids hardcoded values scattered across pages.
 */

// ── Pagination ──────────────────────────────────────────
export const PRODUCTS_PER_PAGE = 24

// ── Auth ────────────────────────────────────────────────
/** Max seconds to wait on the auth-callback page before redirecting to login */
export const AUTH_CALLBACK_TIMEOUT_MS = 6000

// ── Scroll-to-top button ────────────────────────────────
/** Minimum scrollY (px) before the button can appear */
export const SCROLL_TOP_THRESHOLD = 200
/** Debounce delay (ms) to avoid flicker on micro-gestures */
export const SCROLL_TOP_DEBOUNCE_MS = 150

// ── Search ──────────────────────────────────────────────
/** Minimum characters before allowing a search submit */
export const SEARCH_MIN_LENGTH = 2

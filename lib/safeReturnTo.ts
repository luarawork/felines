// Validates a `returnTo` query param before it's used for a post-auth
// redirect. Reported during the final pre-submission security audit —
// LoginForm/SignupForm passed the raw param straight to router.push(),
// so a crafted link like /login?returnTo=//evil.com or
// ?returnTo=https://evil.com could send a user somewhere off-site right
// after they authenticate. Only an internal, single-segment path is
// allowed: it must start with exactly one "/" (not "//" or "/\", both of
// which browsers/some routers treat as protocol-relative).
export function getSafeReturnTo(returnTo: string | null): string | null {
  if (!returnTo) return null;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//") || returnTo.startsWith("/\\")) {
    return null;
  }
  return returnTo;
}

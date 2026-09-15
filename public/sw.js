// Intentionally does no caching. This project redeploys multiple times per session
// during active testing (see MVP_SPEC.md) -- a caching service worker would risk
// testers getting stuck on a stale build after every push. Its only job is to exist
// with a fetch listener, which is what Chromium's install-prompt (PWA "Add to Home
// Screen") criteria checks for; it never intercepts or caches a response.
self.addEventListener("fetch", () => {});

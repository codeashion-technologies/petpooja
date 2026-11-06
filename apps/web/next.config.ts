import type { NextConfig } from "next";

// Browser only ever talks to ONE origin (this Next.js server) — API calls
// are proxied server-side to the backend. Same reasoning as nodedr-pos:
// this keeps the session cookie first-party, avoiding the cross-origin
// cookie fragility that broke that app's very first version. NOTE: Next
// bakes the rewrite destination at build time, so in Docker this must come
// from a build ARG, not a runtime env var (see nodedr-pos memory).
const rawBackendUrl = (process.env.BACKEND_URL ?? "http://localhost:4000").trim();
let BACKEND_URL = rawBackendUrl;
if (!BACKEND_URL.startsWith("http://") && !BACKEND_URL.startsWith("https://")) {
  BACKEND_URL = BACKEND_URL.includes(".")
    ? `https://${BACKEND_URL}`
    : `http://${BACKEND_URL}:10000`;
}

const nextConfig: NextConfig = {
  ...(process.env.OPEN_NEXT ? {} : { output: "standalone" }),
  // socket.io's endpoint is literally "/socket.io/" — the backend 404s on the
  // slash-less form, so Next must not redirect it.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      // Realtime push (socket.io) goes through the same origin too: in
      // production only this web server is reachable, never the backend's
      // own port. socket.io starts with long-polling, which proxies fine.
      // Literal first: an empty :path* would drop the trailing slash.
      { source: "/socket.io/", destination: `${BACKEND_URL}/socket.io/` },
      { source: "/socket.io/:path+", destination: `${BACKEND_URL}/socket.io/:path+` },
    ];
  },
};

export default nextConfig;

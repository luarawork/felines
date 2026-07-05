import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oyncjimmwgyxvkmdqxpv.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Baseline hardening headers — this app embeds a Leaflet map and renders
  // user-generated content (colony narratives, letters, report text), so
  // clickjacking and MIME-sniffing protections are worth having even
  // though there's no API surface beyond Supabase's own.
  async headers() {
    // Third-party origins the app actually talks to: Supabase (data +
    // storage), OpenStreetMap tile servers (map imagery, subdomains
    // a/b/c), OpenWeatherMap (current-weather banner), and Nominatim
    // (reverse geocoding for city auto-fill on colony creation).
    // Next.js dev mode relies on eval() for HMR/debugging (React never
    // uses it in production), so 'unsafe-eval' is scoped to dev only.
    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://oyncjimmwgyxvkmdqxpv.supabase.co https://*.tile.openstreetmap.org",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://oyncjimmwgyxvkmdqxpv.supabase.co https://api.openweathermap.org https://nominatim.openstreetmap.org",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;

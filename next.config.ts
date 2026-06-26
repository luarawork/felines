import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baseline hardening headers — this app embeds a Leaflet map and renders
  // user-generated content (colony narratives, letters, report text), so
  // clickjacking and MIME-sniffing protections are worth having even
  // though there's no API surface beyond Supabase's own.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

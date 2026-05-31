/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  // Native modules with platform-specific .node binaries can't be bundled
  // by webpack; we externalise them so Node loads them at runtime.
  serverExternalPackages: ["@resvg/resvg-js", "sharp"],
  // The admin dashboard reads the editorial YAML calendars at runtime;
  // ensure they ship in the serverless bundle.
  outputFileTracingIncludes: {
    "/admin": ["./editorial/**"],
    "/admin/social": ["./editorial/**"],
    // The cron + webhook routes import title-overlay.ts which readFileSync's
    // the Inter font from node_modules. Vercel's static tracing doesn't see
    // dynamic readFileSync, so we tell it explicitly to ship the font.
    "/api/cron/daily-social": [
      "./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    ],
    "/api/cron/daily-draft": [
      "./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    ],
  },
  // The agents/lib modules use ESM-style ".js" extensions in their relative
  // imports (so tsx + tsc happy on local CLI). Webpack doesn't resolve
  // those to ".ts" by default; this alias makes the build follow the same
  // path resolution that tsc + tsx already use. Required by the cron +
  // webhook routes that import from agents/lib.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;

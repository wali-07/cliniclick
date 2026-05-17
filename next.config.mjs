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
  // The admin dashboard reads the editorial YAML calendars at runtime;
  // ensure they ship in the serverless bundle.
  outputFileTracingIncludes: {
    "/admin": ["./editorial/**"],
    "/admin/social": ["./editorial/**"],
  },
};

export default nextConfig;

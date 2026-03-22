/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    imageSizes: [96, 160, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "prevozkop.rs" },
      { protocol: "https", hostname: "www.prevozkop.rs" },
      { protocol: "https", hostname: "api.prevozkop.rs" }
    ]
  },
  experimental: {
    optimizePackageImports: ["clsx", "swr"]
  },
  async headers() {
    return [
      {
        source: "/img/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      }
    ];
  }
};

export default nextConfig;

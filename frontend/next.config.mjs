/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prevozkop.rs" },
      { protocol: "https", hostname: "www.prevozkop.rs" },
      { protocol: "https", hostname: "api.prevozkop.rs" }
    ]
  },
  experimental: {
    optimizePackageImports: ["clsx", "swr"]
  }
};

export default nextConfig;

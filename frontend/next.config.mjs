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
  },
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/o-nama", destination: "/about-us.html" },
      { source: "/usluge", destination: "/services.html" },
      { source: "/projekti", destination: "/projekti.html" },
      { source: "/projekti-video", destination: "/projekti-video.html" },
      { source: "/kontakt", destination: "/contact-us.html" },
      { source: "/contact-us", destination: "/contact-us.html" },
    ];
  },
};

export default nextConfig;

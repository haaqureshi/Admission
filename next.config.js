/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admission.blackstoneboard.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add experimental features for edge runtime
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admission.blackstoneboard.com',
      },
      {
        protocol: 'https',
        hostname: 'bsol-admission.netlify.app',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Add proper error handling for RSC payload
  experimental: {
    fallbackNodePolyfills: false,
  },
};

module.exports = nextConfig;
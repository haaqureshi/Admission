/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
    ],
  },
  // Add proper error handling for RSC payload
  experimental: {
    fallbackNodePolyfills: false,
  },
};

module.exports = nextConfig;
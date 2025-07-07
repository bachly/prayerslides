/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Only enable static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    assetPrefix: './'
  }),

  // Disable image optimization for static export
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true
  },

  // Configure for static export
  distDir: '.next',

  // Disable server-side features for static export
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig

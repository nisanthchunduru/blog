/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.statically.io'],
    unoptimized: true
  }
}

module.exports = nextConfig

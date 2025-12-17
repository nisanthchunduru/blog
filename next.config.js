const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.statically.io'],
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.alias['@/backend'] = path.resolve(__dirname, 'backend')
    return config
  }
}

module.exports = nextConfig

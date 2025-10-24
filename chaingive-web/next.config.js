/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  images: {
    domains: ['api.chaingive.ng', 'localhost'],
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    react: {
      version: "canary"
    }
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
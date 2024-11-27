/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.react since it's unrecognized
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
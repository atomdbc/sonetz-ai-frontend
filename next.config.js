/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  async rewrites() {
    return [
      {
        source: '/api/integrations/:path*',
        destination: 'http://localhost:8030/integration/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/integrations/microsoft/callback',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/.well-known/microsoft-identity-association.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig
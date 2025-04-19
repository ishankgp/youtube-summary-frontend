/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Map to correct endpoints as defined in main.py
      {
        source: '/api/validate-url',
        destination: 'https://web-production-5da4a.up.railway.app/api/validate-url',
      },
      {
        source: '/api/validate',
        destination: 'https://web-production-5da4a.up.railway.app/api/validate',
      },
      {
        source: '/api/transcripts',
        destination: 'https://web-production-5da4a.up.railway.app/api/transcripts',
      },
      {
        source: '/api/summarize',
        destination: 'https://web-production-5da4a.up.railway.app/api/summarize', 
      },
      {
        source: '/api/refine',
        destination: 'https://web-production-5da4a.up.railway.app/api/refine',
      },
      // Health check endpoint
      {
        source: '/api/health',
        destination: 'https://web-production-5da4a.up.railway.app/',
      },
    ]
  },
}

module.exports = nextConfig 
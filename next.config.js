/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Map to correct endpoints as defined in main.py
      {
        source: '/api/transcripts',
        destination: 'https://youtubesummary-production-2e04.up.railway.app/api/transcripts',
      },
      {
        source: '/api/summarize',
        destination: 'https://youtubesummary-production-2e04.up.railway.app/api/summarize', 
      },
      {
        source: '/api/refine',
        destination: 'https://youtubesummary-production-2e04.up.railway.app/api/refine',
      },
      // Health check endpoint
      {
        source: '/api/health',
        destination: 'https://youtubesummary-production-2e04.up.railway.app/',
      },
    ]
  },
}

module.exports = nextConfig 
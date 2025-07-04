/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

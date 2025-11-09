/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PI1_IP: process.env.NEXT_PUBLIC_PI1_IP || '100.104.127.38',
    NEXT_PUBLIC_PI2_IP: process.env.NEXT_PUBLIC_PI2_IP || '100.114.175.61',
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.railway.app',    pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.up.railway.app', pathname: '/uploads/**' },
    ],
  },
  // Phaser uses browser APIs — keep it out of the server bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'phaser'];
    }
    return config;
  },
}
module.exports = nextConfig
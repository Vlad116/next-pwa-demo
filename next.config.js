const withPWA = require("next-pwa");
const withCSS = require("@zeit/next-css");
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true
  },
  onDemandEntries: {
    maxInactiveAge: 30 * 60 * 1000
  },
  poweredByHeader: false,
  pwa: {
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
  },
  // useFileSystemPublicRoutes: false,
});

// skipWaiting: true,

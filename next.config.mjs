/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  // Netlify specific configuration
  swcMinify: true,
  reactStrictMode: true,
};

export default nextConfig;

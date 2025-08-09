/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeFonts: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
}

export default nextConfig
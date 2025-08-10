/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ← szybki fix: wyłącza optymalizację obrazów po stronie Next
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' }
    ]
  }
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local /public images are served directly by Next.js — no remotePatterns needed.
  // This file silences the "no next.config" warning produced by next/image.
  images: {
    // Allow the default device sizes so next/image can emit responsive srcsets.
    // Do NOT add keyframes here (another branch owns tailwind.config.js).
  },
};

module.exports = nextConfig;

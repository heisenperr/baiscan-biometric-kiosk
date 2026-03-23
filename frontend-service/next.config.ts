import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Uses the IP passed from your script, or defaults to localhost
  allowedDevOrigins: [
    'localhost',
    '0.0.0.0',
    process.env.ALLOWED_HOST || '',
    `${process.env.ALLOWED_HOST}:80`
  ].filter(Boolean),
};

export default nextConfig;
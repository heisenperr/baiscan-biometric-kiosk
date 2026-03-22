import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '0.0.0.0',
    '10.99.119.208',
    '10.99.119.208:80'
  ],
};

export default nextConfig;
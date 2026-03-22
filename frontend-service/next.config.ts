import type { NextConfig } from "next";
import { networkInterfaces } from "os";

const getLocalIPs = () => {
  const nets = networkInterfaces();
  const results: string[] = ["localhost", "0.0.0.0"];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4") {
        results.push(net.address);
        // Add the IP with port 80 and without a port (which defaults to 80)
        results.push(`${net.address}:80`);
      }
    }
  }
  return results;
};

const nextConfig: NextConfig = {
  // This dynamically generates the list Next.js is asking for
  allowedDevOrigins: getLocalIPs(),
};

export default nextConfig;
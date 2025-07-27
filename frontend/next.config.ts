import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.1inch.io/",
        port: "",
        pathname: "/assets/**",
      }
    ]
  },
};

export default nextConfig;

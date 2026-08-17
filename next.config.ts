import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 맥주 사진은 Pexels 원격 이미지를 쓴다 (src/data/beers.ts 의 photo)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
    ],
  },
};

export default nextConfig;

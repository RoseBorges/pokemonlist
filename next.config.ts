import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/**',
        search: '',
      },
    ],
    domains: ['raw.githubusercontent.com'],
  },
};

export default nextConfig;

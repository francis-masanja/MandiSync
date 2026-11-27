import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma's libSQL driver and the generated client are loaded by Node, not
  // bundled into the server component graph.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-libsql', '@libsql/client'],
  // The demo auth store is read with fs at request time; make sure Vercel
  // includes it in the serverless functions that authenticate users.
  outputFileTracingIncludes: {
    '/api/auth/[...nextauth]': ['./data/users.json'],
    '/api/auth/signup': ['./data/users.json'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
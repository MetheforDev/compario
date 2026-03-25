/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: Next.js includes @compario/database in the SWC/webpack
  // compilation pipeline so it can import TypeScript source files directly.
  // Do NOT add @compario/database to serverComponentsExternalPackages —
  // that would tell Next.js to treat it as a Node.js external (skip bundling),
  // which conflicts with transpilePackages and breaks the import.
  transpilePackages: ['@compario/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bxcwpdfeiyrfekzvvujj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;

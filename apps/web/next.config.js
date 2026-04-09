/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: Next.js includes @compario/database in the SWC/webpack
  // compilation pipeline so it can import TypeScript source files directly.
  // Do NOT add @compario/database to serverComponentsExternalPackages —
  // that would tell Next.js to treat it as a Node.js external (skip bundling),
  // which conflicts with transpilePackages and breaks the import.
  // @compario/database: TS source files need transpilation
  // victory-vendor + d3-*: recharts dependencies, ESM-only packages that need bundling
  transpilePackages: [
    '@compario/database',
    'victory-vendor',
    'd3-array', 'd3-color', 'd3-ease', 'd3-format',
    'd3-interpolate', 'd3-path', 'd3-scale', 'd3-shape',
    'd3-time', 'd3-time-format', 'd3-timer',
    'internmap', 'robust-predicates', 'delaunator',
  ],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
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

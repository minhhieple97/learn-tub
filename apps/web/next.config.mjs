/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration (recommended for Next.js 15+)
  turbopack: {
    // Turbopack has built-in support for modern JavaScript and doesn't need
    // the same fallbacks as webpack for browser environments
    resolveAlias: {
      // Add any module aliases if needed in the future
    },
  },

  // Experimental features that help with bundle size
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

export default nextConfig;

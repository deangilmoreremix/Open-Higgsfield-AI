import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'studio',
    'workflow-builder',
    'ai-agent',
    'design-agent',
    'shared-ui',
    'shared-adapters'
  ],
  eslint: {
    // Don't run ESLint during build — source files use non-standard patterns
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't type-check during build — many source files are plain JS
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Redirect lib/muapi.js imports from packages to the actual src/lib/muapi.js
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.resolve(__dirname, 'node_modules/lib/muapi.js')]: path.resolve(__dirname, 'src/lib/muapi.js'),
    };
    return config;
  },
};

export default nextConfig;
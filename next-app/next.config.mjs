/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimize barrel file imports for better tree-shaking
    // This transforms imports from lucide-react to direct icon imports
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

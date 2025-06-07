/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', を削除して通常のサーバーモードで動作させる
  distDir: '.next', // デフォルトのビルドディレクトリに戻す
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'bufferutil' and 'utf-8-validate' on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

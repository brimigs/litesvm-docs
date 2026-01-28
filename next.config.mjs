import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Moved to /docs/additional-crates/ in Jan 2026
      {
        source: '/docs/testing-with-anchor-litesvm/:path*',
        destination: '/docs/additional-crates/testing-with-anchor-litesvm/:path*',
        permanent: true,
      },
      {
        source: '/docs/testing-with-litesvm-utils/:path*',
        destination: '/docs/additional-crates/testing-with-litesvm-utils/:path*',
        permanent: true,
      },
      {
        source: '/docs/testing-with-spl-tokens/:path*',
        destination: '/docs/additional-crates/testing-with-spl-tokens/:path*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);

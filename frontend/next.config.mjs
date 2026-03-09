/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This rewrites section is for local development (`npm run dev`).
  // It proxies requests from your frontend's /api/* to your local backend
  // running on port 5000. This mimics the behavior of the Netlify redirect,
  // allowing you to use relative API paths in your code.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;

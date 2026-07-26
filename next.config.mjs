/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // /llms.txt is served by a route handler. It is mapped through a rewrite
  // rather than a literal `app/llms.txt/` directory, because a route segment
  // containing a dot is fragile across platforms and file watchers.
  async rewrites() {
    return [{ source: '/llms.txt', destination: '/api/llms' }]
  },

  // One canonical hostname: the apex. www permanently redirects to it, path and
  // query preserved.
  //
  // Done here rather than as a Cloudflare redirect rule so it lives in version
  // control and does not depend on how edge rules happen to be ordered against
  // the Worker. Two hostnames serving the same pages would split the ranking
  // signals for every URL on the site — which, for a product whose whole pitch
  // is search visibility, would be an embarrassing thing to get wrong.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.themixify.com' }],
        destination: 'https://themixify.com/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig

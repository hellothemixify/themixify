/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    // Inlining the stylesheet trades one render-blocking request for a bigger
    // document on every single page. Measured both ways against the live site;
    // see the note below the config for which won and by how much.
    inlineCss: false,
    // Only pull in the icons that are actually imported rather than the whole
    // barrel file, which is most of the unused JavaScript in the bundle.
    optimizePackageImports: ['lucide-react'],
  },

  compiler: {
    // Strip console output from the production bundle. console.error stays —
    // losing real errors to save a few bytes is a bad trade.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Source maps would roughly double what the edge has to store and serve for
  // no benefit to a visitor.
  productionBrowserSourceMaps: false,
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
  // Split into two rules on purpose. With a single `/:path*` and an absolute
  // destination, the homepage matches with an empty path and Next emits the
  // literal ":path*" in the Location header instead of substituting it. `/:path+`
  // requires at least one segment, and the root is handled explicitly.
  async redirects() {
    const fromWww = [{ type: 'host', value: 'www.themixify.com' }]

    return [
      {
        source: '/',
        has: fromWww,
        destination: 'https://themixify.com/',
        permanent: true,
      },
      {
        source: '/:path+',
        has: fromWww,
        destination: 'https://themixify.com/:path+',
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
      // /_next/static is deliberately not listed: Next already serves it with
      // `max-age=31536000, immutable`, and overriding it here breaks the dev
      // server's asset invalidation for no gain.
      {
        // Brand assets are not content-hashed, so they get a long browser TTL
        // with a stale-while-revalidate window rather than an immutable one.
        source: '/:file(og.png|logo.webp|icon-192.webp|icon-512.webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig

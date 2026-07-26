import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import incrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

/**
 * OpenNext configuration for Cloudflare Workers.
 *
 * With no incremental cache configured, the Worker re-renders every prerendered
 * page on every request and throws the result away — about 230ms of time to
 * first byte spent rebuilding HTML that has not changed since the build, on
 * every visit.
 *
 * The static-assets cache reads that prerendered output straight from the
 * assets Cloudflare already holds at the edge. It needs no KV namespace, no R2
 * bucket and no queue: it is populated at build time and read-only at runtime,
 * which is exactly right here, because nothing on this site revalidates on
 * demand. The only dynamic surfaces are the checkout page and the llms.txt
 * route handler, and both are marked dynamic and bypass this entirely.
 *
 * If on-demand revalidation is ever needed, this is the line to change: a KV or
 * R2 override in its place, plus the matching binding in wrangler.jsonc.
 */
export default defineCloudflareConfig({ incrementalCache })

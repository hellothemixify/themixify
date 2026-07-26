import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * OpenNext configuration for Cloudflare Workers.
 *
 * The defaults are deliberately left alone. This site is almost entirely
 * prerendered — the only dynamic surfaces are the checkout page and the
 * llms.txt route handler — so there is no incremental cache worth wiring up and
 * no queue to configure. Adding either would be moving parts that buy nothing.
 */
export default defineCloudflareConfig()

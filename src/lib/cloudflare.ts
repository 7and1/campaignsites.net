import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'

const isProduction = process.env.NODE_ENV === 'production'
const isBuild = process.argv.some((value) => value.includes('next build'))

export async function getCloudflareEnv() {
  if (isBuild || !isProduction) {
    const wrangler = await import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`)
    const context = await wrangler.getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      persist: true,
    } satisfies GetPlatformProxyOptions)
    return context.env
  }

  const context = await getCloudflareContext({ async: true })
  return context.env
}

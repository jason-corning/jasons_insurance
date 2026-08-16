import { createFileRoute } from '@tanstack/react-router'

import { HELP_ARTICLES } from '../content/help-articles'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const staticPaths = [
          '/',
          '/shop',
          '/brokers',
          '/faqs',
          '/help',
          '/api-docs',
          '/login',
          '/register',
          '/forgot-password',
          '/forgot-username',
        ]
        const paths = [...staticPaths, ...HELP_ARTICLES.map((a) => `/help/${a.slug}`)]
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>`
        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})

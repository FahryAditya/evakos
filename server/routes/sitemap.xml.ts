import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://evakos-tau.vercel.app'
  const currentDate = new Date().toISOString().split('T')[0]

  let roomUrls: { slug: string; updatedAt: Date }[] = []
  try {
    roomUrls = await prisma.room.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    })
  } catch (err) {
    console.warn('Sitemap fallback due to DB offline:', err)
  }

  const urlsXml = [
    `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...roomUrls.map((r) => {
      const lastmod = r.updatedAt ? new Date(r.updatedAt).toISOString().split('T')[0] : currentDate
      return `  <url>
    <loc>${baseUrl}/kamar/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }),
  ].join('\n')

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')
  return sitemapXml
})

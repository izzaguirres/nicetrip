import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://nicetrip.example'
  const lastmod = new Date()
  const staticPaths = [
    '/',
    '/resultados',
    '/detalhes',
    '/detalhes-hospedagem',
    '/detalhes-passeio',
    '/contacto',
    '/condiciones',
  ]
  return staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: lastmod,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}



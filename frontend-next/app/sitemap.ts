import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://medicare-pranav.vercel.app'
  const lastModified = new Date()
  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/login`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}

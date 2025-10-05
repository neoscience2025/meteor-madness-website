import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neoscience.vercel.app'
  const lastModified = new Date().toISOString()

  const routes = [
    '',
    '/about-team',
    '/aiAssistant',
    '/game',
    '/impact-zone',
    '/machine-learning',
    '/neo-pha',
    '/newsOfWeek',
    '/quiz',
    '/simulation',
    '/story-telling'
  ]

  const locales = ['en', 'es']

  const sitemap: MetadataRoute.Sitemap = []

  // Generate entries for each route and locale
  routes.forEach(route => {
    locales.forEach(locale => {
      const url = route === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${route}`
      
      sitemap.push({
        url,
        lastModified,
        changeFrequency: getChangeFrequency(route),
        priority: getPriority(route),
        alternates: {
          languages: {
            en: route === '' ? `${baseUrl}/en` : `${baseUrl}/en${route}`,
            es: route === '' ? `${baseUrl}/es` : `${baseUrl}/es${route}`,
            'x-default': route === '' ? `${baseUrl}/en` : `${baseUrl}/en${route}`
          }
        }
      })
    })
  })

  return sitemap
}

function getChangeFrequency(route: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  switch (route) {
    case '':
    case '/game':
    case '/simulation':
      return 'weekly'
    case '/newsOfWeek':
    case '/impact-zone':
    case '/neo-pha':
      return 'weekly'
    case '/aiAssistant':
      return 'weekly'
    case '/about-team':
    case '/machine-learning':
    case '/quiz':
    case '/story-telling':
      return 'monthly'
    default:
      return 'monthly'
  }
}

function getPriority(route: string): number {
  switch (route) {
    case '':
      return 1.0
    case '/game':
    case '/simulation':
      return 0.9
    case '/about-team':
    case '/impact-zone':
    case '/neo-pha':
      return 0.8
    case '/aiAssistant':
    case '/newsOfWeek':
    case '/machine-learning':
      return 0.7
    case '/quiz':
    case '/story-telling':
      return 0.6
    default:
      return 0.5
  }
}
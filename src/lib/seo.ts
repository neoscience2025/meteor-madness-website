import { Metadata } from 'next'
import initTranslations from '@/app/i18n'

// Project configuration
const config = {
  companyName: 'NeoScience'
}

export async function getMetadata(
  locale: string, 
  seoNamespace: string, 
  metadataKey: string = 'metadata'
): Promise<Metadata> {
  const { t } = await initTranslations(locale, [seoNamespace])
  
  const seo = t(`${seoNamespace}:${metadataKey}`, {
    returnObjects: true,
    companyName: config.companyName,
  }) as any

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.openGraph?.title || seo.title,
      description: seo.openGraph?.description || seo.description,
      type: seo.openGraph?.type || 'website',
      images: seo.openGraph?.images || [],
    },
    twitter: {
      card: seo.twitter?.card || 'summary_large_image',
      title: seo.twitter?.title || seo.title,
      description: seo.twitter?.description || seo.description,
      images: seo.twitter?.images || [],
    },
  } as Metadata
}
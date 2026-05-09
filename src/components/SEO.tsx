import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterHandle?: string;
}

export default function SEO({
  title = 'Rota Livre Hub - Hub de Utilidade Pública para Viajantes',
  description = 'Ferramentas gratuitas para cicloturistas, mochileiros e aventureiros na América Latina. Conversor de moedas, mapa colaborativo, fusos horários e mais.',
  canonical,
  ogType = 'website',
  ogImage = 'https://rotalivrehub.com/og-image.jpg',
  twitterHandle = '@rotalivrehub',
}: SEOProps) {
  const fullTitle = title.includes('Rota Livre') ? title : `${title} | Rota Livre Hub`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Structured Data - SoftwareApplication */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Rota Livre Hub',
          url: 'https://rotalivrehub.com',
          description: description,
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://rotalivrehub.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}
      </script>
    </Helmet>
  );
}

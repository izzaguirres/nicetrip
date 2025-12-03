import Script from 'next/script'

export default function SchemaMarkup() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Nice Trip Turismo",
    "image": "https://nicetrip.com.br/images/icon.png",
    "description": "Agencia de viajes especializada en paquetes turísticos a Brasil (Florianópolis, Canasvieiras, Bombinhas) desde Argentina.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Madre Maria Villac, 110",
      "addressLocality": "Canasvieiras, Florianópolis",
      "postalCode": "88054-000",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -27.429,
      "longitude": -48.467
    },
    "url": "https://nicetrip.com.br",
    "telephone": "+554899999999", // Ajustar se tiver o real
    "priceRange": "$$",
    "areaServed": ["AR", "BR", "UY"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nicetrip.com.br/resultados?destino={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.instagram.com/nicetripturismo",
      "https://www.facebook.com/nicetripturismo"
    ]
  }

  return (
    <Script
      id="json-ld-organization"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

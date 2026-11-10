/**
 * Jediný zdroj pravdy pre kontaktné údaje salónu.
 * Používa ho home, footer, header, podstránky aj JSON-LD test (e2e/seo.spec.ts).
 * Údaje zodpovedajú Google Business Profilu (place_id nižšie).
 */
export const SALON_CONTACT = {
  name: "PAPI HAIR DESIGN",
  siteUrl: "https://papihairdesign.sk",
  phoneDisplay: "+421 949 459 624",
  phoneHref: "tel:+421949459624",
  phoneE164: "+421949459624",
  email: "papihairdesign@gmail.com",
  address: {
    street: "Trieda SNP 61 (Spoločenský pavilón)",
    city: "Košice",
    postalCode: "040 11",
    region: "Košický kraj",
    country: "SK",
  },
  geo: { lat: 48.7074241, lng: 21.2407423 },
  googlePlaceId: "ChIJE-uzMwjhPkcRxtYuoHWzuw0",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=PAPI+HAIR+DESIGN+Ko%C5%A1ice&query_place_id=ChIJE-uzMwjhPkcRxtYuoHWzuw0",
  bookingUrl: "https://services.bookio.com/papi-hair-design/widget?lang=sk",
  shopUrl: "https://www.goldhaircare.sk/affiliate/2208",
  // Priamy odkaz na napísanie Google recenzie (z Google Business Profilu salónu).
  writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJE-uzMwjhPkcRxtYuoHWzuw0",
  social: {
    instagram: "https://www.instagram.com/papi_hair_design/",
    facebook: "https://www.facebook.com/papihairdesign/",
    tiktok: "https://www.tiktok.com/@papi_hair_design",
  },
} as const;

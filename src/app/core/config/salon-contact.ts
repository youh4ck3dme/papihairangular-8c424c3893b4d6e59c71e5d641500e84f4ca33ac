/**
 * Jediný zdroj pravdy pre kontaktné údaje salónu.
 * Používa ho home, footer aj ďalšie komponenty – nemeň údaje inde.
 */
export const SALON_CONTACT = {
  name: "PAPI HAIR DESIGN",
  phoneDisplay: "+421 949 459 624",
  phoneHref: "tel:+421949459624",
  email: "papihairdesign@gmail.com",
  address: { street: "Trieda SNP 61 (Spoločenský pavilón)", city: "Košice" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=PAPI+HAIR+DESIGN+Trieda+SNP+61+Ko%C5%A1ice",
  bookingUrl: "https://services.bookio.com/papi-hair-design/widget?lang=sk",
  shopUrl: "https://www.goldhaircare.sk/affiliate/2208",
  social: {
    instagram: "https://www.instagram.com/papi_hair_design/",
    facebook: "https://www.facebook.com/papihairdesign/",
    tiktok: "https://www.tiktok.com/@papi_hair_design",
  },
} as const;

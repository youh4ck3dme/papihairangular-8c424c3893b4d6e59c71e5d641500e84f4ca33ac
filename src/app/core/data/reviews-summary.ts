import { SALON_CONTACT } from "../config/salon-contact";

/** Stav podľa zdrojov: Google 5. 11. 2026, Bookio 26. 11. 2026. */
const sources = [
  { label: "Google", rating: 4.8, count: 63, url: SALON_CONTACT.mapsUrl,
    hint: "Otvoriť profil salónu v Mapách Google" },
  { label: "Bookio", rating: 4.9, count: 422, url: SALON_CONTACT.bookingUrl,
    hint: "Otvoriť Bookio. Recenzie zobrazíte kliknutím na počet hodnotení." },
] as const;

const total = sources.reduce((sum, source) => sum + source.count, 0);
const format = new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const REVIEWS_SUMMARY = {
  average: format.format(sources.reduce((sum, source) => sum + source.rating * source.count, 0) / total),
  total,
  sources: sources.map(source => ({ ...source, rating: format.format(source.rating) })),
};

/** Témy, ktoré klienti spomínajú najčastejšie (počty zo zmienok v 85 Bookio textoch). */
export const REVIEW_THEMES: readonly string[] = [
  "Profesionálny prístup",
  "Milý personál",
  "Klienti sa vracajú",
  "Odporúčajú ďalej",
  "Príjemné prostredie",
  "Precízny barber Maťo",
  "Kaderníčka Miška",
];

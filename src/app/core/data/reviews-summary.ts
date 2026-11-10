/**
 * Súhrn hodnotení pre sekciu Recenzie na domovskej stránke.
 * Čísla overené 5. 11. 2026 z Bookio widgetu a Google Business Profilu.
 * Zdroje:
 *  - Bookio: https://services.bookio.com/papi-hair-design/widget?lang=sk (419 hodnotení, priemer 4,93)
 *  - Google: place_id ChIJE-uzMwjhPkcRxtYuoHWzuw0 (63 recenzií, 4,8)
 * Kombinovane: 482 hodnotení, vážený priemer 4,91 → zobrazujeme „4,9".
 */
export const REVIEWS_SUMMARY = {
  /** Zobrazený priemer (zaokrúhlený na 1 desatinné miesto). */
  average: "4,9",
  /** Spolu hodnotení naprieč zdrojmi. */
  total: 482,
  sources: [
    { label: "Google", rating: "4,8", count: 63 },
    { label: "Bookio", rating: "4,93", count: 419 },
  ],
} as const;

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

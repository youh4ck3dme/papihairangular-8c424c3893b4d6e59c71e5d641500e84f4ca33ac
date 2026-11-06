/**
 * Schválené recenzie z Bookio (text doslovne, bez úprav) – stav 5. 11. 2026.
 * Zdroj: https://services.bookio.com/papi-hair-design/widget?lang=sk
 * Používajú ich stránky služieb; neskôr aj sekcia Recenzie na home (prompt-recenzie.md).
 */
export interface CuratedReview {
  name: string;
  /** d.m.yyyy ako v Bookio */
  date: string;
  rating: number;
  text: string;
  source: 'bookio';
}

export const CURATED_REVIEWS: readonly CuratedReview[] = [
  { name: 'Leonard', date: '20.6.2026', rating: 5, source: 'bookio', text: 'Všetko bolo super, Maťo je veľmi kvalitný a precízny barber s dôrazom na detail, odporúčam.' },
  { name: 'Patrik', date: '1.4.2026', rating: 5, source: 'bookio', text: 'Vkusné barberstvo s dobrou lokalitou na terase. Veľmi šikovný barber Maťo ;) Super služby za dobré ceny. Odporúčam a určite sa tu ešte zastavím.' },
  { name: 'Annamária', date: '26.1.2026', rating: 5, source: 'bookio', text: 'So všetkým som maximálne spokojná, bolo na 100% vyhovené mojej predstave o strihu. Ďakujem:)' },
  { name: 'Katarína', date: '7.1.2026', rating: 5, source: 'bookio', text: 'Jednoznačne odporúčam. Úžasný kolektív a ako stále dokonalý strih. Ďakujeme' },
  { name: 'Anna', date: '19.11.2025', rating: 5, source: 'bookio', text: 'Cítila som sa s vami skvelo. Personál perfektný a vlasy vyzerajú krásne. Profesionálna práca ďakujem pekne.' },
  { name: 'Iryna', date: '17.10.2025', rating: 5, source: 'bookio', text: 'Odporúčam salón Papi ☺️všetkým, ktorí si vážia kvalitu, profesionalitu a dobrú náladu po návšteve 💇‍♀️✨' },
  { name: 'Dominika', date: '13.2.2026', rating: 5, source: 'bookio', text: 'Veľká spokojnosť s Miškou. Ďakujem za cenné rady k starostlivosti o vlasy.' },
  { name: 'Richard', date: '15.2.2026', rating: 5, source: 'bookio', text: 'Skvelý strih, príjemné prostredie a milý personál. Odporúčame aj pre staršie deti.' },
  { name: 'Agnieszka', date: '26.8.2026', rating: 5, source: 'bookio', text: 'Príjemná atmosfera, profesionálny prístup, len tak ďalej!' },
  { name: 'Galina', date: '24.3.2026', rating: 5, source: 'bookio', text: 'Príjemné prostredie, milý personál, vysoká odbornosť.... veľká spokojnosť' },
  { name: 'Patrik', date: '26.5.2026', rating: 5, source: 'bookio', text: 'Martin je pecka barber, dá sa snim pokecať a spraví super účes :) pekne prostredie.' },
  { name: 'Mária', date: '29.9.2025', rating: 5, source: 'bookio', text: 'Spokojnosť, profesionálny prístup, super výsledok, príjemné prostredie. Odporúčam' },
  { name: 'Adrians', date: '29.8.2025', rating: 5, source: 'bookio', text: 'Milá, usmievavá, šikovná kaderníčka,ktorá ochotne poradí a perfektne urobí svoju prácu. Vrele odporúčam.' },
  { name: 'Klaudia', date: '4.9.2025', rating: 5, source: 'bookio', text: 'Vždy najlepšie kaderníctvo kde sa človek vracia s radosťou ❤️' },
  { name: 'Nikoletta', date: '22.10.2024', rating: 5, source: 'bookio', text: 'Miška mi vykúzlila nádhernú farbu. Ďakujem 🤗' },
  { name: 'Lukáš', date: '11.7.2024', rating: 5, source: 'bookio', text: 'Maximálna spokojnosť , perfektný profesionálny prístup , môj syn bol super ostrihany do buducná už chodí cela rodina. Ďakujem' },
  { name: 'Filip', date: '28.10.2025', rating: 5, source: 'bookio', text: 'Profesionálny prístup, originálne prostredie, milý personál. Vždy veľká spokojnosť.' },
  { name: 'Judita', date: '6.11.2025', rating: 5, source: 'bookio', text: 'Moja prvá návšteva salôna a som veľmi spokojná!' },
  { name: 'Nikola', date: '16.8.2024', rating: 5, source: 'bookio', text: 'Veľmi precízne a kvalitne odvedená práca 👌 Som extrémne spokojná s výsledkom 🤩' },
  { name: 'Fausto', date: '6.8.2024', rating: 5, source: 'bookio', text: 'Everybody is kind 🙂 I had great haircut thanks for that ! I’ll be back from France 🇫🇷🔥' },
  { name: 'Ingrid', date: '10.10.2025', rating: 5, source: 'bookio', text: 'Ďakujem Miške, s melirom som spokojna.' },
  { name: 'Dominika', date: '4.9.2026', rating: 5, source: 'bookio', text: 'Spokojnosť ako vždy. Miška je odborník vo svojej práci.' },
];

/** Recenzie, ktorých text vyhovuje regexu (max `limit`), najnovšie prvé. */
export function reviewsMatching(re: RegExp, limit = 3): CuratedReview[] {
  const toTime = (d: string) => { const [day, m, y] = d.split('.').map(Number); return new Date(y, m - 1, day).getTime(); };
  return CURATED_REVIEWS.filter(r => re.test(r.text)).sort((a, b) => toTime(b.date) - toTime(a.date)).slice(0, limit);
}

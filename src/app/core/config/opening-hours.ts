/**
 * Otváracie hodiny – jediný zdroj pre BusinessHoursService, footer, kontakt aj JSON-LD.
 * dayIndex: 0 = nedeľa … 6 = sobota (ako Date.getDay()).
 * `open` = 'HH:MM' | 'Podľa objednávok' | 'ZAVRETÉ'.
 */
export interface OpeningHour {
  day: string;
  dayIndex: number;
  open: string;
  close: string;
  /** schema.org deň – len pre dni s pevnými hodinami */
  schemaDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
}

export const OPENING_HOURS: readonly OpeningHour[] = [
  { day: 'Pondelok', dayIndex: 1, open: '08:00', close: '17:00', schemaDay: 'Monday' },
  { day: 'Utorok', dayIndex: 2, open: '08:00', close: '17:00', schemaDay: 'Tuesday' },
  { day: 'Streda', dayIndex: 3, open: '08:00', close: '17:00', schemaDay: 'Wednesday' },
  { day: 'Štvrtok', dayIndex: 4, open: '08:00', close: '17:00', schemaDay: 'Thursday' },
  { day: 'Piatok', dayIndex: 5, open: '08:00', close: '17:00', schemaDay: 'Friday' },
  { day: 'Sobota', dayIndex: 6, open: 'Podľa objednávok', close: '' },
  { day: 'Nedeľa', dayIndex: 0, open: 'ZAVRETÉ', close: 'ZAVRETÉ' },
];

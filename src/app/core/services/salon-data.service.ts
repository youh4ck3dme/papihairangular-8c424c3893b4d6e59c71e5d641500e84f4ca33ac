import { Injectable, signal } from '@angular/core';
import { Stylist } from '../models';

/**
 * Statické údaje o tíme (stránka O nás).
 * Predtým sa ukladali do localStorage ako „simulovaný backend“ – návštevníci potom
 * videli zastarané texty aj po úprave kódu. Teraz je zdroj pravdy iba tento súbor.
 */
const SALON_STYLISTS: Stylist[] = [
  {
    id: 'papi',
    name: 'Róbert „Papi“ Papcun',
    title: 'Founder & Creative Director',
    imageUrl: '/images/papi.webp',
    services: [],
    description: 'Zakladateľ značky a vizionár, ktorý sa kaderníctvu venuje od roku 2009. Špecializuje sa na kompletné premeny, precízne geometrické strihy a kreatívne farbenie. Jeho vášňou je posúvať hranice klasického kaderníctva a vzdelávať novú generáciu stylistov.',
    skills: ['Kreatívne strihy', 'Coloristika', 'Vzdelávanie', 'Premeny']
  },
  {
    id: 'mato',
    name: 'Maťo',
    title: 'Master Barber',
    imageUrl: '/images/mato.webp',
    services: [],
    description: 'Expert na pánsky styling a precíznosť. Od dokonalých fadeov až po klasické úpravy brady s rituálom horúceho uteráka. Maťo prináša do salónu atmosféru a kvalitu pravého gentleman\'s barberingu.',
    skills: ['Fade strihy', 'Úprava brady', 'Hot Towel', 'Pánsky styling']
  },
  {
    id: 'miska',
    name: 'Miška',
    title: 'Senior Stylist',
    imageUrl: '/images/miska.webp',
    services: [],
    description: 'Odborníčka na techniky balayage a starostlivosť o dlhé vlasy. Jej cit pre detail a jemné prechody farieb zaručuje prirodzený a zdravý vzhľad. Miluje vytváranie svadobných a spoločenských účesov.',
    skills: ['Balayage & Melír', 'Spoločenské účesy', 'Starostlivosť o vlasy', 'Dámske strihy']
  }
];

@Injectable({ providedIn: 'root' })
export class SalonDataService {
  private readonly _stylists = signal<Stylist[]>(SALON_STYLISTS);
  readonly stylists = this._stylists.asReadonly();
}


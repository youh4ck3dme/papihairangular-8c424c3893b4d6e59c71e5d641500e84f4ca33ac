
export type StyleCategory = 'Klasika' | 'Moderné' | 'Vlny' | 'Spoločenské' | 'Avantgarda';

export interface Hairstyle {
    id: string;
    name: string;
    description: string;
    category: StyleCategory;
    image: string;
    prompt: string;
}

export type TutorialStep = 'welcome' | 'upload' | 'selection' | 'magic' | 'finished';

export const STYLE_CATEGORIES: StyleCategory[] = ['Klasika', 'Moderné', 'Vlny', 'Spoločenské', 'Avantgarda'];

export const HAIRSTYLES: Hairstyle[] = [
    {
        id: 'blonde-bob',
        name: 'Parížske Mikádo',
        description: 'Nadčasový strih s jemným blond nádychom.',
        category: 'Klasika',
        image: '/assets/logo-header.webp',
        prompt: 'Elegant sharp blonde bob hairstyle, luxury fashion photography, platinum tones'
    },
    {
        id: 'pixie-cut',
        name: 'Platinový Pixie',
        description: 'Odvážna textúra pre modernú ženu.',
        category: 'Moderné',
        image: '/assets/logo-header.webp',
        prompt: 'Bold short pixie cut, edgy textured modern look, silver blonde'
    },
    {
        id: 'balayage-waves',
        name: 'Karamelový Balayage',
        description: 'Prirodzené plážové vlny plné života.',
        category: 'Vlny',
        image: '/assets/logo-header.webp',
        prompt: 'Caramel balayage long wavy hair, sun-kissed look, voluminous beach waves'
    },
    {
        id: 'royal-updo',
        name: 'Kráľovský Výčes',
        description: 'Zložitý upletený štýl pre výnimočné noci.',
        category: 'Spoločenské',
        image: '/assets/logo-header.webp',
        prompt: 'Intricate royal updo hairstyle, elegant braids, red carpet look'
    },
    {
        id: 'neon-shag',
        name: 'Futuristický Shag',
        description: 'Experiment s farbou a geometriou.',
        category: 'Avantgarda',
        image: '/assets/logo-header.webp',
        prompt: 'Futuristic avant-garde shag haircut, multi-tonal highlights, geometric precision'
    }
];

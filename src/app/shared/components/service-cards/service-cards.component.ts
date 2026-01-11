import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ServiceCard {
    id: number;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    benefits: string[];
    link: string;
    external?: boolean;
}

@Component({
    selector: 'app-service-cards',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './service-cards.component.html',
    styleUrls: ['./service-cards.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceCardsComponent implements AfterViewInit {
    @ViewChildren('card') cards!: QueryList<ElementRef>;

    services = signal<ServiceCard[]>([
        {
            id: 1,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors"><circle cx="6" cy="7" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="17" r="3"/><path d="M14.47 14.48 20 20"/><path d="M8.12 15.88 12 12"/></svg>`,
            title: 'Dámske Strihy',
            subtitle: 'Precízny styling',
            description: 'Individuálny prístup k vašim vlasom. Od klasiky po najnovšie trendy, vytvoríme strih, ktorý podčiarkne vašu osobnosť.',
            benefits: ['Konzultácia zdarma', 'Umývanie a styling', 'Profesionálne produkty'],
            link: '/damske-strihy',
            external: false
        },
        {
            id: 2,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.648 0-.485-.301-.924-.722-1.25-.143-.091-.217-.194-.235-.247-.026-.075-.041-.147-.041-.211 0-.354.207-.643.468-.921.053-.058.108-.112.165-.162.37-.33.82-.692 1.339-1.027C17.1 16.394 22 13.25 22 12 22 6.5 17.5 2 12 2z"/></svg>`,
            title: 'Farbenie & Balayage',
            subtitle: 'Umenie farieb',
            description: 'Špecializujeme sa na techniky Balayage, AirTouch a korekcie farieb. Používame prémiové farby pre zdravý lesk.',
            benefits: ['Balayage & AirTouch', 'Korekcia farieb', 'Prémiové farby'],
            link: '/damske-strihy',
            external: false
        },
        {
            id: 3,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-barber-pole"><path d="M14.4 3.9a2 2 0 0 0-2.4 0L4.5 9.6a2 2 0 0 0 0 2.4l7.5 7.5a2 2 0 0 0 2.4 0l7.5-7.5a2 2 0 0 0 0-2.4Z"/><path d="M12 2v20"/><path d="m22 12-20 0"/></svg>`,
            title: 'Barber & Pánske',
            subtitle: 'Gentleman\'s choice',
            description: 'Kompletná starostlivosť pre mužov. Precízne strihy, úprava brady a rituál s horúcim uterákom.',
            benefits: ['Hot Towel rituál', 'Úprava brady', 'Káva zdarma'],
            link: '/panske-strihy',
            external: false
        },
        {
            id: 4,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.9 10.8c.3.9.9 1.6 1.6 1.9l.2.1c.4.1.7.2 1 .2h.2c.4 0 .7-.1 1-.2l.2-.1c.7-.3 1.3-1 1.6-1.9l.1-.2c.1-.4.2-.7.2-1v-.2c0-.4-.1-.7-.2-1l-.1-.2c-.3-.9-.9-1.6-1.6-1.9l-.2-.1c-.4-.1-.7-.2-1-.2h-.2c-.4 0-.7.1-1 .2l-.2.1c-.7.3-1.3 1-1.6 1.9l-.1.2c-.1.4-.2.7-.2 1v.2c0 .4.1.7.2 1l.1.2Z"/><path d="M19 2v2"/><path d="M20.5 4.5 22 6"/><path d="M22 12h-2"/><path d="M20.5 19.5 22 18"/><path d="M19 22v-2"/><path d="M12 22h-2"/><path d="M4.5 19.5 3 18"/><path d="M2 12h2"/><path d="M3 6 4.5 4.5"/><path d="M12 2h-2"/></svg>`,
            title: 'Vlasové Kúry',
            subtitle: 'Regenerácia',
            description: 'Hĺbková regenerácia pre poškodené vlasy. Keratín, Nová Kúra a hydratačné kúry pre okamžitý efekt.',
            benefits: ['Keratínová kúra', 'Proteínová kúra', 'Hydratačná kúra'],
            link: '/damske-strihy',
            external: false
        },
        {
            id: 5,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wedding-dress"><path d="M12 21a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3 3 3 0 0 0-3 3v13a3 3 0 0 0 3 3Z"/><path d="m12 5 6 4"/><path d="m12 5-6 4"/><path d="M12 21v-8"/><path d="M16 16h-8"/></svg>`,
            title: 'Spoločenské Účesy',
            subtitle: 'Pre výnimočné chvíle',
            description: 'Svadobné a spoločenské účesy, ktoré vydržia celú noc. Skúška účesu a konzultácia v cene.',
            benefits: ['Skúška účesu', 'Dlhotrvajúca fixácia', 'Konzultácia v cene'],
            link: '/damske-strihy',
            external: false
        },
        {
            id: 6,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
            title: 'Produkty',
            subtitle: 'Domáca starostlivosť',
            description: 'Poradíme vám s výberom profesionálnej kozmetiky na doma, aby vaše vlasy boli krásne každý deň.',
            benefits: ['Gold Haircare', 'Profesionálna kozmetika', 'Odborné poradenstvo'],
            link: 'http://www.goldhaircare.sk/affiliate/2208',
            external: true
        }
    ]);

    ngAfterViewInit() {
        // Mouse move effect for glow
        const cardsArray = this.cards.toArray();

        document.addEventListener('mousemove', (e) => {
            cardsArray.forEach(cardRef => {
                const card = cardRef.nativeElement;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
}

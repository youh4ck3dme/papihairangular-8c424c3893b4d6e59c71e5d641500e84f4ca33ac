import {
    Component,
    ChangeDetectionStrategy,
    AfterViewInit,
    inject,
    PLATFORM_ID,
    signal,
    OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { fadeSlideIn } from '../../../core/animations';

declare const gsap: unknown;
declare const ScrollTrigger: unknown;

@Component({
    selector: 'app-pribeh-znacky',
    templateUrl: './pribeh-znacky.component.html',
    styleUrls: ['./pribeh-znacky.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterLink],
    animations: [fadeSlideIn],
})
export class PribehZnackyComponent implements AfterViewInit, OnDestroy {
    private seoService = inject(SeoService);
    private platformId = inject(PLATFORM_ID);

    readingProgress = signal(0);
    private scrollHandler: (() => void) | null = null;

    images = {
        hero: 'assets/papi.webp',
        abstract: '/images/DBB9AE05-73B8-44A5-9776-13B1FE68F777_4_5005_c.jpeg',
        oldSchool: 'assets/images/camera.webp',
        interior: 'assets/salon-interior-mirrored.jpg',
        team: 'assets/papi-blog.png',
        logo: '/images/DBB9AE05-73B8-44A5-9776-13B1FE68F777_4_5005_c.jpeg',
    };

    constructor() {
        this.seoService.updateMetaTags({
            title: 'Príbeh značky | PAPI HAIR DESIGN - From Streets to World Stages',
            description:
                'Príbeh Róberta Papcuna – od košického sídliska po svetové módne prehliadky. Zakladateľ PAPI HAIR DESIGN.',
            keywords:
                'PAPI HAIR DESIGN, Róbert Papcun, príbeh, kaderníctvo, Košice, barbering, fashion week',
            ogImage: 'https://papihairdesign.sk/assets/papi.webp',
        });
    }

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.initScrollProgress();
            this.loadGsapAndAnimate();
        }
    }

    ngOnDestroy(): void {
        if (this.scrollHandler && isPlatformBrowser(this.platformId)) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
    }

    private initScrollProgress(): void {
        this.scrollHandler = () => {
            const doc = document.documentElement;
            const winScroll = doc.scrollTop || document.body.scrollTop;
            const height = doc.scrollHeight - doc.clientHeight;
            if (height > 0) {
                this.readingProgress.set((winScroll / height) * 100);
            }
        };
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    private loadGsapAndAnimate(): void {
        // Check if GSAP is already loaded
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            this.initAnimations();
            return;
        }

        // Load GSAP dynamically
        const gsapScript = document.createElement('script');
        gsapScript.src =
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        gsapScript.onload = () => {
            const stScript = document.createElement('script');
            stScript.src =
                'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
            stScript.onload = () => this.initAnimations();
            document.head.appendChild(stScript);
        };
        document.head.appendChild(gsapScript);
    }

    private initAnimations(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = gsap as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ST = ScrollTrigger as any;

        g.registerPlugin(ST);

        // Hero Text Reveal
        g.to('.fade-in', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.3,
            ease: 'power3.out',
        });

        // Parallax Effect for Hero Image
        g.to('.hero-img', {
            yPercent: 20,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.header-trigger',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });

        // Timeline Blocks Reveal
        const blocks = document.querySelectorAll('.timeline-block');
        blocks.forEach((block) => {
            g.to(block, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: block,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        // Image Reveal Effects
        const images = document.querySelectorAll('.image-container img');
        images.forEach((img) => {
            g.from(img, {
                scale: 1.1,
                duration: 1.5,
                scrollTrigger: {
                    trigger: img,
                    start: 'top 90%',
                    scrub: 1,
                },
            });
        });
    }

    getFacebookShareUrl(): string {
        if (isPlatformBrowser(this.platformId)) {
            return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        }
        return '';
    }

    getInstagramUrl(): string {
        return 'https://www.instagram.com/papihairdesign/';
    }

    getTikTokUrl(): string {
        return 'https://www.tiktok.com/@papihairdesign';
    }
}

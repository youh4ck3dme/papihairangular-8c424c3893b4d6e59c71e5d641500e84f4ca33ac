import { trigger, transition, style, animate, state } from '@angular/animations';

export const fadeSlideIn = trigger('fadeSlideIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
]);

export const slideInLeft = trigger('slideInLeft', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
]);

export const slideInRight = trigger('slideInRight', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
]);

export const hoverScale = trigger('hoverScale', [
    state('idle', style({ transform: 'scale(1)' })),
    state('hover', style({ transform: 'scale(1.05)' })),
    transition('idle <=> hover', animate('200ms ease-in-out'))
]);

export const fadeIn = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
    ])
]);

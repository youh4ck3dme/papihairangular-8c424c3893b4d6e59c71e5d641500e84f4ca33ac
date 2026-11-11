import {
  ApplicationConfig, LOCALE_ID, PLATFORM_ID, inject, isDevMode, provideAppInitializer, provideZonelessChangeDetection,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { APP_ROUTES } from './app.routes';
import { IdlePreloadStrategy } from './core/routing/idle-preload.strategy';
import { IMAGE_PROVIDERS } from './core/images/image-loader';
import { startRealUserMonitoring } from './core/perf/web-vitals';

/**
 * Spoločná konfigurácia pre prehliadač aj build-time prerendering (main.server.ts).
 * Prerenderované HTML sa v prehliadači hydratuje (DOM sa znovu použije, bez preblikovania).
 * Prvky závislé od aktuálneho času (stav otvorené/zatvorené) sa vykreslia až v prehliadači (isBrowser).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'sk' },
    // bez zone.js: menší bundle a menej práce pri štarte (celý stav aplikácie je v signals)
    provideZonelessChangeDetection(),
    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withPreloading(IdlePreloadStrategy),
      // Prechod medzi stránkami (slide + fade) cez natívne View Transitions API prehliadača.
      // SSR/prerender-safe (na serveri no-op), samotný efekt je v styles.css (::view-transition-*).
      withViewTransitions(),
    ),
    // event replay: klik pred dokončením hydratácie sa nestratí
    provideClientHydration(withEventReplay()),
    // NgOptimizedImage: srcset z predgenerovaných variantov (scripts/gen-images.mjs)
    ...IMAGE_PROVIDERS,
    // Web Vitals od návštevníkov – len v prehliadači, v nečinnosti a len s nastaveným VITALS_ENDPOINT
    provideAppInitializer(() => {
      if (isPlatformBrowser(inject(PLATFORM_ID))) startRealUserMonitoring();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

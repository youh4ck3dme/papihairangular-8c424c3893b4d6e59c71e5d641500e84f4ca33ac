import { ApplicationConfig, LOCALE_ID, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { APP_ROUTES } from './app.routes';

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
    provideRouter(APP_ROUTES, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    // animácie sa načítajú lenivo – menší hlavný bundle
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    // event replay: klik pred dokončením hydratácie sa nestratí
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

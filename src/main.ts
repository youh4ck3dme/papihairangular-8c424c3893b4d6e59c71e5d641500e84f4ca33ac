import { bootstrapApplication, provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { isDevMode } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { APP_ROUTES as routes } from "./app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ...(!isDevMode() ? [provideClientHydration(withEventReplay())] : [])
  ],
}).then(appRef => {
  // Initialize service worker update service
  if (!isDevMode()) {
    import('./app/core/services/sw-update.service').then(({ ServiceWorkerUpdateService }) => {
      const swUpdateService = appRef.injector.get(ServiceWorkerUpdateService);
      swUpdateService.initialize();
      console.log('✅ Service Worker update service initialized');
    });
  }
}).catch(err => console.error('Bootstrap error:', err));

import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { isDevMode } from '@angular/core';
import localeSk from '@angular/common/locales/sk';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Slovenské formáty dátumov a čísel (DatePipe: „5. januára 2026“)
registerLocaleData(localeSk);

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    if (!isDevMode()) {
      import('./app/core/services/sw-update.service').then(({ ServiceWorkerUpdateService }) => {
        appRef.injector.get(ServiceWorkerUpdateService).initialize();
      });
    }
  })
  .catch(err => console.error('Bootstrap error:', err));

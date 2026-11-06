import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { serverRoutes } from './app/app.routes.server';

registerLocaleData(localeSk);

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

/** Build-time prerendering (angular.json → outputMode: static). */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, mergeApplicationConfig(appConfig, serverConfig), context);

export default bootstrap;

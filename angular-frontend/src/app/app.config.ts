import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakService, KeycloakAngularModule, KeycloakBearerInterceptor } from 'keycloak-angular';

import { routes } from './app.routes';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'ecom-realm',
        clientId: 'ecom-client'
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false
      }
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(KeycloakAngularModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ]
};

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './core/Auth/auth.interceptor';
import { routes } from './app.routes';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';

import Aura from '@primeng/themes/aura';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

// Registra o service worker (PWA) apenas em produção, para não
// interferir no desenvolvimento com HMR/cache.
if (environment.production && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.error('Falha ao registrar o service worker:', err));
  });
}

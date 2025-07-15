import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { App } from './app/app';
import { routes } from './app/app.routes'; // Assure-toi que le chemin est correct

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes), // ✅ Nécessaire pour activer le routing
    provideHttpClient(withFetch())
  ]
});

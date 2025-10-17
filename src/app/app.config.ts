import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './core/mock/in-memory-data';
import { SeedDataService } from './core/services/seed-data';
import { SEED_DB } from './app.tokens';

export function seedInitializer(seed: SeedDataService) {
  return () => seed.loadAll(); // load assets (json/csv) into SEED_DB before app starts
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        apiBase: '/api/',
        delay: 200,
        passThruUnknownUrl: true, // let /assets/* load normally
      })
    ),

    // ✅ Provide a mutable object; SeedDataService will fill it
    { provide: SEED_DB, useValue: { champions: [], summonerSpells: [], games: [] } },

    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SeedDataService],
      useFactory: seedInitializer,
    },
  ],
};

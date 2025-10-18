import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './core/mock/in-memory-data';
import { SeedDataService } from './core/services/seed-data';
import { SEED_DB } from './app.tokens';

export function seedInitializer(seed: SeedDataService) {
  return () => seed.loadAll();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Provide mutable seed object
    { provide: SEED_DB, useValue: { champions: [], summonerSpells: [], games: [] } },

    // APP_INITIALIZER must come BEFORE the in-memory API
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SeedDataService],
      useFactory: seedInitializer,
    },

    // In-memory API configuration
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        apiBase: 'api/', // Important: avec le slash final
        delay: 200,
        passThruUnknownUrl: true,
      })
    ),
  ],
};
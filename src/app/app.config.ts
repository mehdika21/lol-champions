// app.config.ts
import { ApplicationConfig, APP_INITIALIZER, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export interface SeedDb { 
  champions: any[]; 
}

export const SEED_DB = new InjectionToken<SeedDb>('SEED_DB');

const FILES = [
  'assets/data/champion_info.json',
  'assets/data/champion_info_2.json',
];

async function loadDataset(seed: SeedDb): Promise<void> {
  try {
    const resps = await Promise.all(FILES.map(url => fetch(url)));
    const jsons = await Promise.all(resps.map(r => r.ok ? r.json() : null));
    
    // Filter out null responses and extract champions from nested data object
    const merged = jsons
      .filter(json => json != null)
      .flatMap((json: any) => {
        // Handle nested data structure: { data: { championKey: {...} } }
        if (json.data && typeof json.data === 'object') {
          return Object.values(json.data);
        }
        // Handle array format: [{...}, {...}]
        if (Array.isArray(json)) {
          return json;
        }
        // Handle direct object values: { championKey: {...} }
        if (typeof json === 'object') {
          return Object.values(json);
        }
        return [];
      })
      .filter((champion: any) => champion.id !== -1 && champion.name && champion.name !== 'None');
    
    seed.champions = merged;
    console.log(`✅ Loaded ${seed.champions.length} champions`);
  } catch (e) {
    console.error('❌ Dataset load failed:', e);
    seed.champions = [];
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: SEED_DB, useValue: { champions: [] } },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SEED_DB],
      useFactory: (seed: SeedDb) => () => loadDataset(seed),
    },
  ],
};
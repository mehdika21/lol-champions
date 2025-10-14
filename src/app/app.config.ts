// app.config.ts
import { ApplicationConfig, APP_INITIALIZER, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export interface SeedDb { 
  champions: any[];
  games: any[];
}

export const SEED_DB = new InjectionToken<SeedDb>('SEED_DB');

const CHAMPION_FILES = [
  // 'assets/data/champion_info.json',
  'assets/data/champion_info_2.json',
];

const GAMES_FILE = 'assets/data/games.csv';

function parseCSV(text: string): any[] {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  
  // Split by newlines - try both \r\n and \n
  let lines = cleanText.includes('\r\n') 
    ? cleanText.split('\r\n') 
    : cleanText.split('\n');
  
  // Filter out completely empty lines
  lines = lines.filter(line => line && line.trim().length > 0);
  
  console.log(`Total lines in CSV: ${lines.length}`);
  
  if (lines.length < 2) {
    console.warn(`CSV file has only ${lines.length} line(s), need at least 2 (header + data)`);
    return [];
  }
  
  // Parse header row
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim());
  console.log(`CSV Headers: ${headers.length} columns - ${headers.slice(0, 5).join(', ')}...`);
  
  // Parse data rows
  const data = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, colIndex) => {
      const value = (values[colIndex] || '').trim();
      // Try to convert to number, otherwise keep as string
      obj[header] = value === '' ? null : isNaN(Number(value)) ? value : Number(value);
    });
    
    return obj;
  });
  
  console.log(`CSV parsed: ${data.length} rows with ${headers.length} columns`);
  if (data.length > 0) {
    console.log('First row sample:', Object.keys(data[0]).slice(0, 5).map(k => `${k}: ${data[0][k]}`).join(', '));
  }
  return data;
}

async function loadDataset(seed: SeedDb): Promise<void> {
  try {
    // Load champions
    const champResps = await Promise.all(CHAMPION_FILES.map(url => fetch(url)));
    const champJsons = await Promise.all(champResps.map(r => r.ok ? r.json() : null));
    
    const mergedChamps = champJsons
      .filter(json => json != null)
      .flatMap((json: any) => {
        if (json.data && typeof json.data === 'object') {
          return Object.values(json.data);
        }
        if (Array.isArray(json)) {
          return json;
        }
        if (typeof json === 'object') {
          return Object.values(json);
        }
        return [];
      })
      .filter((champion: any) => champion.id !== -1 && champion.name && champion.name !== 'None');
    
    seed.champions = mergedChamps;
    console.log(`✅ Loaded ${seed.champions.length} champions`);

    // Load games CSV
    try {
      const gamesResp = await fetch(GAMES_FILE);
      console.log(`Games file response status: ${gamesResp.status}`);
      
      if (gamesResp.ok) {
        const csvText = await gamesResp.text();
        console.log(`Raw CSV text length: ${csvText.length} characters`);
        console.log(`First 200 chars: ${csvText.substring(0, 200)}`);
        
        const games = parseCSV(csvText);
        seed.games = games;
        console.log(`✅ Loaded ${seed.games.length} games`);
      } else {
        console.warn(`Games file returned status ${gamesResp.status}, file might not exist at ${GAMES_FILE}`);
        seed.games = [];
      }
    } catch (e) {
      console.warn('Could not load games file:', e);
      seed.games = [];
    }
  } catch (e) {
    console.error('❌ Dataset load failed:', e);
    seed.champions = [];
    seed.games = [];
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: SEED_DB, useValue: { champions: [], games: [] } },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SEED_DB],
      useFactory: (seed: SeedDb) => () => loadDataset(seed),
    },
  ],
};
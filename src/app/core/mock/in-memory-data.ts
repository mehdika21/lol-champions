// src/app/core/mock/in-memory-data.ts
import { Injectable, Injector } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { SEED_DB, SeedDb } from '../../app.tokens';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  constructor(private injector: Injector) {}

  private get seed(): SeedDb {
    return this.injector.get(SEED_DB);
  }

  // Override parseRequestUrl to ignore /assets/ requests completely
  parseRequestUrl(url: string, utils: any): any {
    // Pass through /assets/ requests - return undefined to skip processing
    if (url.includes('assets/')) {
      console.log(`[InMemoryDB] Passing through asset URL: ${url}`);
      return undefined;
    }
    
    // Use default parsing for everything else
    const parsed = utils.parseRequestUrl(url);
    console.log(`[InMemoryDB] Parsed URL: ${url} → collection: "${parsed?.collectionName}"`);
    return parsed;
  }

  createDb() {
    // Return empty structure initially
    return {
      champions: [],
      summonerSpells: [],
      games: [],
    };
  }

  // Override to handle requests properly
  get(req: RequestInfo): any {
    const collectionName = req.collectionName;
    
    console.log(`[InMemoryDB] GET request for collection: "${collectionName}"`);

    // Only handle our API collections
    if (!collectionName || !['champions', 'summonerSpells', 'games'].includes(collectionName)) {
      console.warn(`[InMemoryDB] Unknown collection "${collectionName}", passing through`);
      return undefined; // Pass through
    }

    // Get data from seed
    let data: any[] = [];
    
    switch (collectionName) {
      case 'champions':
        data = this.seed.champions ?? [];
        break;
      case 'summonerSpells':
        data = this.seed.summonerSpells ?? [];
        break;
      case 'games':
        data = this.seed.games ?? [];
        break;
    }

    console.log(`[InMemoryDB] Found ${data.length} items in ${collectionName}`);

    // Handle search query
    const searchQuery = req.query.get('q')?.[0]?.toLowerCase();
    if (searchQuery) {
      console.log(`[InMemoryDB] Filtering by query: "${searchQuery}"`);
      data = data.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(searchQuery)
      );
      console.log(`[InMemoryDB] After filtering: ${data.length} items`);
    }

    // Ensure data is serializable (no circular references)
    try {
      const cleanData = JSON.parse(JSON.stringify(data));
      
      const response: ResponseOptions = {
        body: cleanData,
        status: STATUS.OK,
        statusText: 'OK',
        headers: req.headers.set('Content-Type', 'application/json'),
        url: req.url
      };

      console.log(`[InMemoryDB] ✅ Returning ${cleanData.length} items`);
      return req.utils.createResponse$(() => response);
      
    } catch (error) {
      console.error('[InMemoryDB] Error serializing data:', error);
      
      const errorResponse: ResponseOptions = {
        body: { error: 'Failed to serialize data' },
        status: STATUS.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
        headers: req.headers.set('Content-Type', 'application/json'),
        url: req.url
      };
      
      return req.utils.createResponse$(() => errorResponse);
    }
  }
}
import { Injectable, inject } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import { SEED_DB, SeedDb } from '../../app.tokens'; // ✅ correct import

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  private seed = inject<SeedDb>(SEED_DB);

  createDb() {
    return {
      champions: this.seed.champions,
      summonerSpells: this.seed.summonerSpells,
      games: this.seed.games,
    };
  }

  get(req: RequestInfo) {
    const name = req.collectionName;
    if (!['champions', 'summonerSpells', 'games'].includes(name)) return undefined;

    const q = req.query.get('q')?.[0]?.toLowerCase() ?? '';
    let data = req.collection as any[];

    if (q) data = data.filter(row => JSON.stringify(row).toLowerCase().includes(q));

    const options: ResponseOptions = { body: data, status: 200 };
    return req.utils.createResponse$(() => options);
  }
}

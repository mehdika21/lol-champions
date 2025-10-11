import { Injectable, inject } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import { SEED_DB, SeedDb } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  private seed = inject(SEED_DB);

  createDb() {
    return { champions: this.seed.champions ?? [] };
  }

  get(requestInfo: RequestInfo) {
    if (requestInfo.collectionName === 'champions') {
      const q = requestInfo.query.get('q')?.[0]?.toLowerCase() ?? '';
      let data = requestInfo.collection as any[];
      if (q) data = data.filter(c => `${c.name} ${c.title}`.toLowerCase().includes(q));

      const options: ResponseOptions = { body: data, status: 200 };
      return requestInfo.utils.createResponse$(() => options);
    }
    return undefined;
  }
}

// core/services/summoner-spells.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface SummonerSpell {
  id: number | string;
  name: string;
  key: string;
  description: string;
  summonerLevel?: number;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class SummonerSpellsService {
  // 👉 Point directly to your assets JSON (no backend, no interceptor)
  private readonly assetsUrl = 'assets/data/summoner_spell_info.json';

  constructor(private http: HttpClient) {}

  list(q?: string): Observable<SummonerSpell[]> {
    const query = (q ?? '').toLowerCase();

    return this.http.get<any>(this.assetsUrl).pipe(
      map((raw) => {
        // Your file shape is: { type, version, data: { "1": {...}, "3": {...}, ... } }
        const arr: SummonerSpell[] = raw?.data
          ? Object.values(raw.data) as SummonerSpell[]
          : Array.isArray(raw) ? raw as SummonerSpell[] : [];

        if (!query) return arr;

        // simple client-side filter
        return arr.filter(s =>
          (s.name || '').toLowerCase().includes(query) ||
          (s.key || '').toLowerCase().includes(query) ||
          (s.description || '').toLowerCase().includes(query) ||
          String(s.summonerLevel ?? '').includes(query)
        );
      })
    );
  }

  // keep API parity if you need it later (no-op for assets)
  delete(_id: string | number): Observable<void> {
    // Not applicable when reading from assets; implement against a real API if needed.
    throw new Error('delete() is not supported when using assets data.');
  }
}

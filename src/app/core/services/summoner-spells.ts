// src/app/core/services/summoner-spells.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private http = inject(HttpClient);

  // ✅ List from the mock API so delete affects the same dataset
  list(q?: string): Observable<SummonerSpell[]> {
    const params = (q && q.trim()) ? new HttpParams().set('q', q) : undefined;
    return this.http.get<SummonerSpell[]>('/api/summonerSpells', { params });
  }

  // ✅ Delete from the same collection; note camelCase: summonerSpells
  delete(idOrKey: string): Observable<void> {
    return this.http.delete<void>(`/api/summonerSpells/${encodeURIComponent(idOrKey)}`);
  }
}

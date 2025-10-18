// src/app/core/services/seed-data.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SEED_DB, SeedDb } from '../../app.tokens';

@Injectable({ providedIn: 'root' })
export class SeedDataService {
  private readyPromise: Promise<void> | null = null;
  private isReady = false;

  constructor(private http: HttpClient, @Inject(SEED_DB) private db: SeedDb) {}

  /** Returns a promise that resolves when seed data is loaded */
  ready(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    return this.readyPromise ?? Promise.resolve();
  }

  /** Loads JSON assets into the in-memory DB token before the app starts. */
  async loadAll(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    
    this.readyPromise = this._load();
    await this.readyPromise;
    this.isReady = true;
  }

  private async _load(): Promise<void> {
    console.log('[SeedData] Starting to load assets...');

    try {
      const [championsRaw, spells, gamesJson] = await Promise.all([
        firstValueFrom(
          this.http
            .get<any>('/assets/data/champion_info_2.json')
            .pipe(catchError(this.swallow('champions', {})))
        ),
        firstValueFrom(
          this.http
            .get<any[]>('/assets/data/summoner_spell_info.json')
            .pipe(catchError(this.swallow('summonerSpells', [])))
        ),
        firstValueFrom(
          this.http
            .get<any[]>('/assets/data/games.json')
            .pipe(catchError((err) => {
              console.error('[SeedData] Failed to load games.json:', err);
              return of([]);
            }))
        ),
      ]);

      // Populate the shared seed database
      this.db.champions = this.normalizeChampions(championsRaw);
      this.db.summonerSpells = spells ?? [];
      this.db.games = gamesJson ?? [];

      console.log('[SeedData] ✅ Load complete:', {
        champions: this.db.champions.length,
        summonerSpells: this.db.summonerSpells.length,
        games: this.db.games.length
      });

      // Verify games data
      if (this.db.games.length > 0) {
        console.log('[SeedData] Sample game:', this.db.games[0]);
      } else {
        console.error('[SeedData] ⚠️ No games loaded! Check games.json file.');
      }
    } catch (err) {
      console.error('[SeedData] Fatal load error:', err);
      this.db.champions = [];
      this.db.summonerSpells = [];
      this.db.games = [];
    }
  }

  /** Normalize DDragon-like champions JSON into an array */
  private normalizeChampions(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    
    if (raw && raw.data && typeof raw.data === 'object') {
      return Object.values(raw.data).map((c: any) => ({
        id: c.id,
        name: c.name,
        title: c.title,
        tags: c.tags ?? [],
        key: c.id,
        ...c,
      }));
    }
    
    if (raw && Array.isArray(raw.champions)) return raw.champions;
    
    console.warn('[SeedData] Champions JSON not recognized; returning empty array.');
    return [];
  }

  /** Swallow asset errors but log them */
  private swallow<T>(label: string, fallback: T) {
    return (err: unknown) => {
      console.warn(`[SeedData] Could not load ${label}:`, err);
      return of(fallback);
    };
  }
}
// src/app/core/services/seed-data.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SEED_DB, SeedDb } from '../../app.tokens';

@Injectable({ providedIn: 'root' })
export class SeedDataService {
  constructor(private http: HttpClient, @Inject(SEED_DB) private db: SeedDb) {}

  /** Loads assets (JSON + CSV) into the in-memory DB token before the app starts. */
  async loadAll(): Promise<void> {
    try {
      const [champions, spells, gamesCsv] = await Promise.all([
        firstValueFrom(
          this.http
            .get<any[]>('/assets/data/champion_info.json')
            .pipe(catchError(this.swallow('champions', [])))
        ),
        firstValueFrom(
          this.http
            .get<any[]>('/assets/data/summoner_spell_info.json')
            .pipe(catchError(this.swallow('summonerSpells', [])))
        ),
        firstValueFrom(
          this.http
            .get('/assets/data/games.csv', { responseType: 'text' as 'text' })
            .pipe(catchError(this.swallow('games.csv', '')))
        ),
      ]);

      this.db.champions = champions ?? [];
      this.db.summonerSpells = spells ?? [];
      this.db.games = this.parseCsv(gamesCsv);
      // console.log('[SeedData] Loaded:', {
      //   champions: this.db.champions.length,
      //   summonerSpells: this.db.summonerSpells.length,
      //   games: this.db.games.length,
      // });
    } catch (err) {
      console.error('[SeedData] Fatal load error:', err);
      // still ensure arrays exist so the app doesn’t crash
      this.db.champions ||= [];
      this.db.summonerSpells ||= [];
      this.db.games ||= [];
    }
  }

  /** Convert CSV text → array of objects (supports quoted commas and escaped quotes). */
  private parseCsv(csvText: string): any[] {
    if (!csvText) return [];
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return [];

    const headers = this.splitCsvLine(lines[0]);
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.splitCsvLine(lines[i]);
      const obj: any = {};
      headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ''));

      // Optional casting for your known numeric fields
      this.castNumber(obj, 'creationTime');
      this.castNumber(obj, 'gameDuration');
      this.castNumber(obj, 'seasonId');
      this.castNumber(obj, 'winner');
      this.castNumber(obj, 'firstBlood');
      this.castNumber(obj, 'firstTower');

      rows.push(obj);
    }
    return rows;
  }

  /** Split a single CSV line into columns, respecting quotes and escaped quotes. */
  private splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++; // skip escaped quote
        } else {
          inQ = !inQ;
        }
      } else if (ch === ',' && !inQ) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  private castNumber(obj: any, key: string) {
    if (obj[key] !== undefined && obj[key] !== '') {
      const n = Number(obj[key]);
      obj[key] = Number.isNaN(n) ? obj[key] : n;
    }
  }

  /** Small helper to swallow 404/other asset errors but log them once. */
  private swallow<T>(label: string, fallback: T) {
    return (err: unknown) => {
      console.warn(`[SeedData] Could not load ${label}:`, err);
      return of(fallback);
    };
  }
}

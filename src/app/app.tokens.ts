import { InjectionToken } from '@angular/core';

export interface SeedDb {
  champions: any[];
  summonerSpells: any[];
  games: any[];
}

export const SEED_DB = new InjectionToken<SeedDb>('SEED_DB');

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeedStore {
  champions: any[] = [];
  summonerSpells: any[] = [];
  games: any[] = []; // parsed from CSV
}

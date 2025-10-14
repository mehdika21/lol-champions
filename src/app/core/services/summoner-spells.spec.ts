import { TestBed } from '@angular/core/testing';

import { SummonerSpells } from './summoner-spells';

describe('SummonerSpells', () => {
  let service: SummonerSpells;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummonerSpells);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

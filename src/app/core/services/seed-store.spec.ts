import { TestBed } from '@angular/core/testing';

import { SeedStore } from './seed-store';

describe('SeedStore', () => {
  let service: SeedStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

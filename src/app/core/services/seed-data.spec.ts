import { TestBed } from '@angular/core/testing';

import { SeedData } from './seed-data';

describe('SeedData', () => {
  let service: SeedData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { SeedDataService } from './seed-data';

describe('SeedDataService', () => {
  let service: SeedDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

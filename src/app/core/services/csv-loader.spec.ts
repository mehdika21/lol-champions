import { TestBed } from '@angular/core/testing';

import { CsvLoader } from './csv-loader';

describe('CsvLoader', () => {
  let service: CsvLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

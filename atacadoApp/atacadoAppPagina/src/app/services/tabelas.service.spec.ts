import { TestBed } from '@angular/core/testing';

import { TabelasService } from './tabelas.service';

describe('TabelasService', () => {
  let service: TabelasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabelasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

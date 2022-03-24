import { TestBed } from '@angular/core/testing';

import { ProdutosEmpresasService } from './produtos-empresas.service';

describe('ProdutosEmpresasService', () => {
  let service: ProdutosEmpresasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutosEmpresasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

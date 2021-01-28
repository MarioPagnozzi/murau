import { TestBed } from '@angular/core/testing';

import { ImagemProdutosService } from './imagem-produtos.service';

describe('ImagemProdutosService', () => {
  let service: ImagemProdutosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagemProdutosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

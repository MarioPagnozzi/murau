import { TestBed } from '@angular/core/testing';

import { PermissaoService } from './permissao.service';

describe('PermissaoService', () => {
  let service: PermissaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

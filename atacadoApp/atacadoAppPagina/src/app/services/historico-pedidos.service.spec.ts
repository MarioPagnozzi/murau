import { TestBed } from '@angular/core/testing';

import { HistoricoPedidosService } from './historico-pedidos.service';

describe('HistoricoPedidosService', () => {
  let service: HistoricoPedidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricoPedidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

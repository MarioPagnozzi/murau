import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IHistoricoPedidos } from '../interfaces/IHistoricoPedidos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class HistoricoPedidosService extends BaseService<IHistoricoPedidos> {

  constructor(public http: HttpService) {
    super("historicoPedidos", http);
   }
}

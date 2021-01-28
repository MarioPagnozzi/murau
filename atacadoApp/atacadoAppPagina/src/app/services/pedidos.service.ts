import { Injectable } from '@angular/core';
import { BaseService } from '../base/baseService';
import { IPedidos } from '../interfaces/IPedidos';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService extends BaseService<IPedidos> {

  constructor(public http: HttpService) {
    super("pedidos", http);
   }
}

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base/baseService';
import { IPedidos } from '../interfaces/IPedidos';
import { PedidosModel } from '../models/pedidosModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService extends BaseService<PedidosModel> {

  constructor(public http: HttpService) {
    super("pedidos", http);
   }
   async TotalPedidosDia(): Promise<number> {
    const pedidos = await this.http.get(`${environment.url_api}/pedidos/novos/peddia`);
    let total = 0;
    if (pedidos.data) {
      pedidos.data.forEach(() => {
        total = total + 1;
      })
    }
    return total;
  }
}
